import { SeloType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { autoConfirmFromPending } from './arvore.service';
import type { CreateEventInput } from '../schemas/event.schema';

export async function createEvent(userId: string, input: CreateEventInput) {
  // Auto-provisiona um Organizer para o usuário (foundation stage).
  const organizer = await prisma.organizer.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const venue = await prisma.venue.create({ data: input.venue });

  const event = await prisma.event.create({
    data: {
      name: input.name,
      description: input.description,
      date: input.date,
      endDate: input.endDate,
      styles: input.styles,
      capacity: input.capacity,
      venueId: venue.id,
      organizerId: organizer.id,
      isPublished: true,
    },
    include: { venue: true },
  });

  // Cada evento ganha seu Selo de presença.
  await prisma.selo.create({
    data: {
      name: `Presente: ${event.name}`,
      emoji: '🎶',
      type: SeloType.EVENT,
      eventId: event.id,
      description: `Você esteve no ${event.name}.`,
    },
  });

  if (input.ticketTypes?.length) {
    await prisma.ticketType.createMany({
      data: input.ticketTypes.map((t) => ({
        eventId: event.id,
        name: t.name,
        price: t.price,
        quantity: t.quantity,
      })),
    });
  }

  return event;
}

type Scope = 'upcoming' | 'past' | 'all';

export async function listEvents(filters: {
  scope?: Scope;
  city?: string;
  style?: string;
}) {
  const now = new Date();
  const dateWhere =
    filters.scope === 'past'
      ? { date: { lt: now } }
      : filters.scope === 'all'
        ? {}
        : { date: { gte: now } };

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      ...dateWhere,
      ...(filters.city
        ? { venue: { city: { contains: filters.city, mode: 'insensitive' } } }
        : {}),
      ...(filters.style ? { styles: { has: filters.style } } : {}),
    },
    orderBy: { date: 'asc' },
    include: {
      venue: { select: { name: true, city: true, state: true } },
      organizer: { select: { companyName: true, user: { select: { name: true } } } },
      _count: { select: { checkins: true } },
    },
  });

  return events.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    endDate: e.endDate,
    styles: e.styles,
    coverImageUrl: e.coverImageUrl,
    venue: e.venue,
    organizer: e.organizer.companyName ?? e.organizer.user.name,
    checkinCount: e._count.checkins,
  }));
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      organizer: { select: { companyName: true, user: { select: { name: true } } } },
      lineup: {
        orderBy: { order: 'asc' },
        select: {
          order: true,
          startTime: true,
          dj: { select: { artistName: true } },
        },
      },
      tickets: { where: { isActive: true }, orderBy: { price: 'asc' } },
      _count: { select: { checkins: true } },
    },
  });

  if (!event) throw new AppError(404, 'Evento não encontrado');
  return event;
}

export async function listCheckins(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');

  const checkins = await prisma.checkin.findMany({
    where: { eventId },
    orderBy: { checkedAt: 'asc' },
    select: {
      checkedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          nucleoType: true,
        },
      },
    },
  });

  return { eventId, total: checkins.length, checkins };
}

export async function checkin(
  userId: string,
  eventId: string,
  coords?: { lat?: number; lng?: number }
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.isPublished) {
    throw new AppError(404, 'Evento não encontrado');
  }

  const existing = await prisma.checkin.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  const record = await prisma.checkin.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, lat: coords?.lat, lng: coords?.lng },
    update: { lat: coords?.lat, lng: coords?.lng },
  });

  // Selo de presença do evento.
  const eventSelo = await prisma.selo.findFirst({
    where: { eventId, type: SeloType.EVENT },
    select: { id: true, name: true, emoji: true },
  });
  if (eventSelo) {
    await prisma.userSelo.upsert({
      where: { userId_seloId: { userId, seloId: eventSelo.id } },
      create: { userId, seloId: eventSelo.id, metadata: { eventId } },
      update: {},
    });
  }

  // Gatilho da árvore: 1º checkin/selo confirma o superior pendente.
  const superiorLinked = await autoConfirmFromPending(userId);

  return {
    alreadyCheckedIn: Boolean(existing),
    checkedInAt: record.checkedAt,
    event: { id: event.id, name: event.name },
    eventSelo: eventSelo ? { name: eventSelo.name, emoji: eventSelo.emoji } : null,
    superiorLinked,
  };
}
