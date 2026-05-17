import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';
import { awardAchievementByName } from './selo.service';

const ETERNIZADO_SELO = 'Eternizado';

async function userNames(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: { id: true, name: true },
  });
  return new Map(users.map((u) => [u.id, u.name]));
}

export async function uploadPhoto(
  userId: string,
  eventId: string,
  input: {
    imageUrl: string;
    thumbnailUrl?: string;
    isPublic: boolean;
    tagUserIds?: string[];
  }
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');

  // Auto-provisiona o fotógrafo (foundation stage).
  const professional = await prisma.professional.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const photo = await prisma.photo.create({
    data: {
      eventId,
      photographerId: professional.id,
      imageUrl: input.imageUrl,
      thumbnailUrl: input.thumbnailUrl,
      isPublic: input.isPublic,
    },
  });

  let taggedCount = 0;
  const ids = [...new Set(input.tagUserIds ?? [])].filter((id) => id !== userId);
  if (ids.length > 0) {
    // Só dá pra marcar quem fez check-in no evento.
    const present = await prisma.checkin.findMany({
      where: { eventId, userId: { in: ids } },
      select: { userId: true },
    });
    const validIds = present.map((c) => c.userId);

    if (validIds.length > 0) {
      await prisma.photoTag.createMany({
        data: validIds.map((uid) => ({ photoId: photo.id, userId: uid })),
      });
      taggedCount = validIds.length;
      for (const uid of validIds) {
        await notifySafe(uid, {
          type: 'EVENT',
          title: '📸 Você foi marcado',
          body: `Te marcaram numa foto de ${event.name}. Aprove ou recuse.`,
          data: { photoId: photo.id },
        });
      }
    }
  }

  return { photo, taggedCount };
}

export async function listEventPhotos(eventId: string) {
  const photos = await prisma.photo.findMany({
    where: { eventId, isPublic: true },
    orderBy: { createdAt: 'desc' },
    include: {
      photographer: { select: { userId: true } },
      tags: { where: { status: 'APPROVED' }, select: { userId: true } },
    },
  });

  const names = await userNames(
    photos.flatMap((p) => [
      p.photographer.userId,
      ...p.tags.map((t) => t.userId),
    ])
  );

  return photos.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    thumbnailUrl: p.thumbnailUrl,
    createdAt: p.createdAt,
    photographer: names.get(p.photographer.userId) ?? 'Fotógrafo',
    taggedPeople: p.tags.map((t) => names.get(t.userId) ?? 'Raver'),
  }));
}

export async function listTaggedPhotos(userId: string) {
  const tags = await prisma.photoTag.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      photo: {
        select: {
          id: true,
          imageUrl: true,
          thumbnailUrl: true,
          createdAt: true,
          event: { select: { name: true } },
        },
      },
    },
  });

  return tags.map((t) => ({
    tagId: t.id,
    status: t.status,
    photo: {
      id: t.photo.id,
      imageUrl: t.photo.imageUrl,
      thumbnailUrl: t.photo.thumbnailUrl,
      createdAt: t.photo.createdAt,
      eventName: t.photo.event.name,
    },
  }));
}

export async function setTagStatus(
  userId: string,
  tagId: string,
  status: 'APPROVED' | 'REJECTED'
) {
  const tag = await prisma.photoTag.findUnique({ where: { id: tagId } });
  if (!tag) throw new AppError(404, 'Marcação não encontrada');
  if (tag.userId !== userId) {
    throw new AppError(403, 'Esta marcação não é sua');
  }
  if (tag.status !== 'PENDING') {
    throw new AppError(409, 'Marcação já foi respondida');
  }

  await prisma.photoTag.update({ where: { id: tagId }, data: { status } });

  if (status === 'APPROVED') {
    await awardAchievementByName(userId, ETERNIZADO_SELO);
  }

  return { tagId, status };
}
