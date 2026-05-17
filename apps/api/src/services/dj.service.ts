import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';
import { awardAchievementByName } from './selo.service';
import type { CreateDJInput, AddLineupInput } from '../schemas/dj.schema';

const NO_PALCO_SELO = 'No Palco';

/** rankScore = seguidores + 2 × participações em line-up. */
export async function recomputeScore(djId: string): Promise<number> {
  const [followers, lineup, paidTips] = await Promise.all([
    prisma.dJFollow.count({ where: { djId } }),
    prisma.lineupEntry.count({ where: { djId } }),
    prisma.tip.count({ where: { djId, status: 'PAID' } }),
  ]);
  const rankScore = followers + 2 * lineup + 3 * paidTips;
  await prisma.dJ.update({ where: { id: djId }, data: { rankScore } });
  return rankScore;
}

export async function becomeDJ(userId: string, input: CreateDJInput) {
  return prisma.dJ.upsert({
    where: { userId },
    update: {
      artistName: input.artistName,
      bio: input.bio,
      style: input.style,
      bpm: input.bpm,
      country: input.country,
      socialLinks: input.socialLinks,
    },
    create: {
      userId,
      artistName: input.artistName,
      bio: input.bio,
      style: input.style,
      bpm: input.bpm,
      country: input.country,
      socialLinks: input.socialLinks,
    },
  });
}

export async function getMyDJ(userId: string) {
  return prisma.dJ.findUnique({ where: { userId } });
}

export async function listDJs(viewerId: string | null, q?: string) {
  const djs = await prisma.dJ.findMany({
    where: q ? { artistName: { contains: q, mode: 'insensitive' } } : undefined,
    orderBy: [{ rankScore: 'desc' }, { createdAt: 'asc' }],
    take: 100,
    include: {
      user: { select: { name: true, username: true } },
      _count: { select: { followers: true, lineup: true } },
    },
  });

  const following = viewerId
    ? new Set(
        (
          await prisma.dJFollow.findMany({
            where: { userId: viewerId, djId: { in: djs.map((d) => d.id) } },
            select: { djId: true },
          })
        ).map((f) => f.djId)
      )
    : new Set<string>();

  return djs.map((d, i) => ({
    id: d.id,
    artistName: d.artistName,
    style: d.style,
    bpm: d.bpm,
    country: d.country,
    rankScore: d.rankScore,
    position: i + 1,
    user: d.user,
    followerCount: d._count.followers,
    lineupCount: d._count.lineup,
    isFollowing: following.has(d.id),
  }));
}

export async function getDJ(viewerId: string | null, id: string) {
  const dj = await prisma.dJ.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, username: true } },
      _count: { select: { followers: true } },
      lineup: {
        orderBy: { event: { date: 'asc' } },
        select: {
          order: true,
          startTime: true,
          event: { select: { id: true, name: true, date: true } },
        },
      },
    },
  });
  if (!dj) throw new AppError(404, 'DJ não encontrado');

  const [isFollowing, tipStats, reviewStats] = await Promise.all([
    viewerId
      ? prisma.dJFollow
          .findUnique({
            where: { userId_djId: { userId: viewerId, djId: id } },
            select: { djId: true },
          })
          .then((r) => r !== null)
      : Promise.resolve(false),
    prisma.tip.aggregate({
      where: { djId: id, status: 'PAID' },
      _count: true,
      _sum: { netAmount: true },
    }),
    prisma.review.aggregate({
      where: { targetType: 'DJ', targetId: dj.userId },
      _count: true,
      _avg: { rating: true },
    }),
  ]);

  return {
    id: dj.id,
    artistName: dj.artistName,
    bio: dj.bio,
    style: dj.style,
    bpm: dj.bpm,
    country: dj.country,
    socialLinks: dj.socialLinks,
    rankScore: dj.rankScore,
    user: dj.user,
    followerCount: dj._count.followers,
    isFollowing,
    lineup: dj.lineup,
    tipCount: tipStats._count,
    tipNetTotal: Number((tipStats._sum.netAmount ?? 0).toFixed(2)),
    reviewCount: reviewStats._count,
    reviewAverage: reviewStats._avg.rating
      ? Number(reviewStats._avg.rating.toFixed(1))
      : 0,
  };
}

export async function follow(userId: string, djId: string) {
  const dj = await prisma.dJ.findUnique({
    where: { id: djId },
    select: { id: true, userId: true, artistName: true },
  });
  if (!dj) throw new AppError(404, 'DJ não encontrado');
  if (dj.userId === userId) {
    throw new AppError(400, 'Você não pode seguir seu próprio perfil de DJ');
  }

  const existing = await prisma.dJFollow.findUnique({
    where: { userId_djId: { userId, djId } },
    select: { djId: true },
  });

  if (!existing) {
    await prisma.dJFollow.create({ data: { userId, djId } });
    await notifySafe(dj.userId, {
      type: 'SYSTEM',
      title: '🎧 Novo seguidor',
      body: `${dj.artistName} ganhou mais um seguidor na cena.`,
      data: { djId },
    });
  }

  const rankScore = await recomputeScore(djId);
  return { djId, following: true, rankScore };
}

export async function unfollow(userId: string, djId: string) {
  await prisma.dJFollow.deleteMany({ where: { userId, djId } });
  const rankScore = await recomputeScore(djId);
  return { djId, following: false, rankScore };
}

export async function addLineup(
  userId: string,
  eventId: string,
  input: AddLineupInput
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, organizer: { select: { userId: true } } },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');
  if (event.organizer.userId !== userId) {
    throw new AppError(403, 'Apenas o organizador do evento monta o line-up');
  }

  const dj = await prisma.dJ.findUnique({
    where: { id: input.djId },
    select: { id: true, userId: true },
  });
  if (!dj) throw new AppError(404, 'DJ não encontrado');

  const entry = await prisma.lineupEntry.create({
    data: {
      eventId,
      djId: dj.id,
      order: input.order,
      startTime: input.startTime,
      endTime: input.endTime,
    },
  });

  await recomputeScore(dj.id);
  await awardAchievementByName(dj.userId, NO_PALCO_SELO);
  await notifySafe(dj.userId, {
    type: 'EVENT',
    title: '🎧 Você está no line-up!',
    body: `Confirmado no line-up de ${event.name}.`,
    data: { eventId },
  });

  return entry;
}
