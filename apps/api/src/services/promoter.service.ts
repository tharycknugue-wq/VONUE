import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';

export async function enrollPromoter(
  organizerUserId: string,
  eventId: string,
  username: string,
  commission?: number
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, organizer: { select: { userId: true } } },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');
  if (event.organizer.userId !== organizerUserId) {
    throw new AppError(403, 'Apenas o organizador do evento credencia promoters');
  }

  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true },
  });
  if (!target) throw new AppError(404, 'Usuário não encontrado');
  if (target.id === organizerUserId) {
    throw new AppError(400, 'O organizador não promove o próprio evento');
  }

  const promoter = await prisma.promoter.upsert({
    where: { userId: target.id },
    update: {},
    create: { userId: target.id },
  });

  await prisma.eventPromoter.upsert({
    where: { eventId_promoterId: { eventId, promoterId: promoter.id } },
    update: commission !== undefined ? { commission } : {},
    create: {
      eventId,
      promoterId: promoter.id,
      ...(commission !== undefined ? { commission } : {}),
    },
  });

  await notifySafe(target.id, {
    type: 'EVENT',
    title: '📣 Você é promoter!',
    body: `Você foi credenciado para vender ${event.name}.`,
    data: { eventId },
  });

  return { promoterId: promoter.id, code: promoter.id };
}

export async function myPromoter(userId: string) {
  const promoter = await prisma.promoter.findUnique({
    where: { userId },
    include: {
      events: {
        include: { event: { select: { id: true, name: true, date: true } } },
      },
    },
  });

  if (!promoter) {
    return { isPromoter: false, totalSales: 0, code: null, events: [] };
  }

  return {
    isPromoter: true,
    totalSales: promoter.totalSales,
    code: promoter.id,
    events: promoter.events.map((ep) => ({
      eventId: ep.event.id,
      eventName: ep.event.name,
      date: ep.event.date,
      commission: ep.commission,
    })),
  };
}
