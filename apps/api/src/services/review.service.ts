import type { ReviewTarget } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';

export interface ReviewAggregate {
  average: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

async function aggregate(
  targetType: ReviewTarget,
  targetId: string
): Promise<ReviewAggregate> {
  const reviews = await prisma.review.findMany({
    where: { targetType, targetId },
    select: { rating: true },
  });
  const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    const key = String(r.rating) as keyof typeof distribution;
    if (distribution[key] !== undefined) distribution[key] += 1;
  }
  const count = reviews.length;
  const average = count ? Number((sum / count).toFixed(1)) : 0;
  return { average, count, distribution };
}

/** Lista as avaliações de um alvo, respeitando o anonimato. */
async function listReviews(
  targetType: ReviewTarget,
  targetId: string,
  eventId?: string
) {
  const reviews = await prisma.review.findMany({
    where: { targetType, targetId, ...(eventId ? { eventId } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      isAnonymous: true,
      reviewerId: true,
    },
  });

  const namedIds = reviews.filter((r) => !r.isAnonymous).map((r) => r.reviewerId);
  const users = namedIds.length
    ? await prisma.user.findMany({
        where: { id: { in: [...new Set(namedIds)] } },
        select: { id: true, name: true },
      })
    : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    reviewer: r.isAnonymous ? null : { name: nameById.get(r.reviewerId) ?? 'Raver' },
  }));
}

async function assertNotReviewed(
  reviewerId: string,
  targetId: string,
  targetType: ReviewTarget,
  eventId: string | null,
  message: string
) {
  const existing = await prisma.review.findFirst({
    where: {
      reviewerId,
      targetId,
      targetType,
      ...(eventId ? { eventId } : { eventId: null }),
    },
    select: { id: true },
  });
  if (existing) throw new AppError(409, message);
}

// ==================== ORGANIZADOR ====================

async function loadEventOrganizer(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      organizer: { select: { id: true, userId: true } },
    },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');
  return event;
}

export async function reviewOrganizer(
  reviewerId: string,
  eventId: string,
  input: { rating: number; comment?: string; anonymous: boolean }
) {
  const event = await loadEventOrganizer(eventId);
  const targetId = event.organizer.userId;

  if (targetId === reviewerId) {
    throw new AppError(403, 'Você não pode avaliar a própria organização');
  }
  const checkin = await prisma.checkin.findUnique({
    where: { userId_eventId: { userId: reviewerId, eventId } },
    select: { id: true },
  });
  if (!checkin) {
    throw new AppError(403, 'Faça check-in no evento para avaliar a organização');
  }
  await assertNotReviewed(
    reviewerId,
    targetId,
    'ORGANIZER',
    eventId,
    'Você já avaliou esta organização neste evento'
  );

  const review = await prisma.review.create({
    data: {
      reviewerId,
      targetId,
      targetType: 'ORGANIZER',
      eventId,
      rating: input.rating,
      comment: input.comment,
      isAnonymous: input.anonymous,
    },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });

  const agg = await aggregate('ORGANIZER', targetId);
  await prisma.organizer.update({
    where: { id: event.organizer.id },
    data: { rating: agg.average },
  });

  await notifySafe(targetId, {
    type: 'EVENT',
    title: '⭐ Nova avaliação',
    body: `Sua organização recebeu ${input.rating}★ em ${event.name}.`,
    data: { eventId },
  });

  return { review, aggregate: agg };
}

export async function eventOrganizerReviews(eventId: string) {
  const event = await loadEventOrganizer(eventId);
  const targetId = event.organizer.userId;
  return {
    organizerUserId: targetId,
    aggregate: await aggregate('ORGANIZER', targetId),
    reviews: await listReviews('ORGANIZER', targetId, eventId),
  };
}

// ==================== DJ ====================

export async function reviewDJ(
  reviewerId: string,
  djId: string,
  input: { rating: number; comment?: string; anonymous: boolean }
) {
  const dj = await prisma.dJ.findUnique({
    where: { id: djId },
    select: { userId: true, artistName: true },
  });
  if (!dj) throw new AppError(404, 'DJ não encontrado');
  if (dj.userId === reviewerId) {
    throw new AppError(403, 'Você não pode se autoavaliar como DJ');
  }

  const sawDJ = await prisma.checkin.findFirst({
    where: { userId: reviewerId, event: { lineup: { some: { djId } } } },
    select: { id: true },
  });
  if (!sawDJ) {
    throw new AppError(
      403,
      'Você só pode avaliar um DJ que tocou num evento em que esteve'
    );
  }

  await assertNotReviewed(
    reviewerId,
    dj.userId,
    'DJ',
    null,
    'Você já avaliou este DJ'
  );

  const review = await prisma.review.create({
    data: {
      reviewerId,
      targetId: dj.userId,
      targetType: 'DJ',
      rating: input.rating,
      comment: input.comment,
      isAnonymous: input.anonymous,
    },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });

  const agg = await aggregate('DJ', dj.userId);
  await notifySafe(dj.userId, {
    type: 'SYSTEM',
    title: '⭐ Nova avaliação',
    body: `${dj.artistName} recebeu ${input.rating}★ como DJ.`,
    data: { djId },
  });

  return { review, aggregate: agg };
}

export async function djReviews(djId: string) {
  const dj = await prisma.dJ.findUnique({
    where: { id: djId },
    select: { userId: true },
  });
  if (!dj) throw new AppError(404, 'DJ não encontrado');
  return {
    aggregate: await aggregate('DJ', dj.userId),
    reviews: await listReviews('DJ', dj.userId),
  };
}

// ==================== FOTÓGRAFO ====================

async function loadPhotoPhotographer(photoId: string) {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: {
      photographerId: true,
      photographer: { select: { userId: true } },
      event: { select: { name: true } },
    },
  });
  if (!photo) throw new AppError(404, 'Foto não encontrada');
  return photo;
}

export async function reviewPhotographer(
  reviewerId: string,
  photoId: string,
  input: { rating: number; comment?: string; anonymous: boolean }
) {
  const photo = await loadPhotoPhotographer(photoId);
  const targetId = photo.photographer.userId;

  if (targetId === reviewerId) {
    throw new AppError(403, 'Você não pode avaliar a si mesmo como fotógrafo');
  }

  const approved = await prisma.photoTag.findFirst({
    where: {
      userId: reviewerId,
      status: 'APPROVED',
      photo: { photographerId: photo.photographerId },
    },
    select: { id: true },
  });
  if (!approved) {
    throw new AppError(
      403,
      'Você só pode avaliar um fotógrafo cuja foto sua você aprovou'
    );
  }

  await assertNotReviewed(
    reviewerId,
    targetId,
    'PHOTOGRAPHER',
    null,
    'Você já avaliou este fotógrafo'
  );

  const review = await prisma.review.create({
    data: {
      reviewerId,
      targetId,
      targetType: 'PHOTOGRAPHER',
      rating: input.rating,
      comment: input.comment,
      isAnonymous: input.anonymous,
    },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });

  const agg = await aggregate('PHOTOGRAPHER', targetId);
  await notifySafe(targetId, {
    type: 'SYSTEM',
    title: '⭐ Nova avaliação',
    body: `Seu trabalho de fotógrafo recebeu ${input.rating}★.`,
    data: { photoId },
  });

  return { review, aggregate: agg };
}

export async function photographerReviews(photoId: string) {
  const photo = await loadPhotoPhotographer(photoId);
  const targetId = photo.photographer.userId;
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { name: true },
  });
  return {
    photographer: { name: user?.name ?? 'Fotógrafo' },
    aggregate: await aggregate('PHOTOGRAPHER', targetId),
    reviews: await listReviews('PHOTOGRAPHER', targetId),
  };
}

// ==================== PROMOTER ====================

async function loadPromoter(promoterId: string) {
  const promoter = await prisma.promoter.findUnique({
    where: { id: promoterId },
    select: { id: true, userId: true },
  });
  if (!promoter) throw new AppError(404, 'Promoter não encontrado');
  return promoter;
}

export async function reviewPromoter(
  reviewerId: string,
  promoterId: string,
  input: { rating: number; comment?: string; anonymous: boolean }
) {
  const promoter = await loadPromoter(promoterId);
  if (promoter.userId === reviewerId) {
    throw new AppError(403, 'Você não pode avaliar a si mesmo como promoter');
  }

  const bought = await prisma.ticket.findFirst({
    where: { userId: reviewerId, promoterId: promoter.id },
    select: { id: true },
  });
  if (!bought) {
    throw new AppError(
      403,
      'Você só pode avaliar um promoter de quem comprou ingresso'
    );
  }

  await assertNotReviewed(
    reviewerId,
    promoter.userId,
    'PROMOTER',
    null,
    'Você já avaliou este promoter'
  );

  const review = await prisma.review.create({
    data: {
      reviewerId,
      targetId: promoter.userId,
      targetType: 'PROMOTER',
      rating: input.rating,
      comment: input.comment,
      isAnonymous: input.anonymous,
    },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });

  const agg = await aggregate('PROMOTER', promoter.userId);
  await prisma.promoter.update({
    where: { id: promoter.id },
    data: { rating: agg.average },
  });
  await notifySafe(promoter.userId, {
    type: 'SYSTEM',
    title: '⭐ Nova avaliação',
    body: `Você recebeu ${input.rating}★ como promoter.`,
    data: { promoterId },
  });

  return { review, aggregate: agg };
}

export async function promoterReviews(promoterId: string) {
  const promoter = await loadPromoter(promoterId);
  const user = await prisma.user.findUnique({
    where: { id: promoter.userId },
    select: { name: true },
  });
  return {
    promoter: { name: user?.name ?? 'Promoter' },
    aggregate: await aggregate('PROMOTER', promoter.userId),
    reviews: await listReviews('PROMOTER', promoter.userId),
  };
}

// ==================== FREELANCER ====================

async function loadHiredJob(jobId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      title: true,
      status: true,
      hiredUserId: true,
      organizer: { select: { userId: true } },
    },
  });
  if (!job) throw new AppError(404, 'Vaga não encontrada');
  return job;
}

export async function reviewFreelancer(
  reviewerId: string,
  jobId: string,
  input: { rating: number; comment?: string; anonymous: boolean }
) {
  const job = await loadHiredJob(jobId);
  if (job.organizer.userId !== reviewerId) {
    throw new AppError(403, 'Apenas o organizador que contratou avalia');
  }
  if (job.status !== 'FILLED' || !job.hiredUserId) {
    throw new AppError(409, 'Esta vaga ainda não tem um contratado');
  }
  const targetId = job.hiredUserId;

  await assertNotReviewed(
    reviewerId,
    targetId,
    'FREELANCER',
    null,
    'Você já avaliou este freelancer por esta vaga'
  );

  const review = await prisma.review.create({
    data: {
      reviewerId,
      targetId,
      targetType: 'FREELANCER',
      rating: input.rating,
      comment: input.comment,
      isAnonymous: input.anonymous,
    },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });

  const agg = await aggregate('FREELANCER', targetId);
  await notifySafe(targetId, {
    type: 'SYSTEM',
    title: '⭐ Nova avaliação',
    body: `Seu trabalho em "${job.title}" recebeu ${input.rating}★.`,
    data: { jobId },
  });

  return { review, aggregate: agg };
}

export async function freelancerReviews(jobId: string) {
  const job = await loadHiredJob(jobId);
  if (!job.hiredUserId) {
    return {
      freelancer: null,
      aggregate: { average: 0, count: 0, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } },
      reviews: [],
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: job.hiredUserId },
    select: { name: true },
  });
  return {
    freelancer: { name: user?.name ?? 'Freelancer' },
    aggregate: await aggregate('FREELANCER', job.hiredUserId),
    reviews: await listReviews('FREELANCER', job.hiredUserId),
  };
}
