import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';
import { awardAchievementByName } from './selo.service';
import { recomputeScore } from './dj.service';
import { credit } from './wallet.service';
import type { CreateTipInput } from '../schemas/tip.schema';

// Monetização: Vonue retém 20% da gorjeta; o DJ recebe 80%.
const COMMISSION_RATE = 0.2;
const MAO_ABERTA_SELO = 'Mão Aberta';

export async function createTip(
  fromId: string,
  djId: string,
  input: CreateTipInput
) {
  const dj = await prisma.dJ.findUnique({
    where: { id: djId },
    select: { id: true, userId: true, artistName: true },
  });
  if (!dj) throw new AppError(404, 'DJ não encontrado');
  if (dj.userId === fromId) {
    throw new AppError(400, 'Você não pode dar gorjeta para si mesmo');
  }

  const amount = Number(input.amount.toFixed(2));
  const commission = Number((amount * COMMISSION_RATE).toFixed(2));
  const netAmount = Number((amount - commission).toFixed(2));
  const paymentId = randomUUID();

  const tip = await prisma.tip.create({
    data: {
      fromId,
      djId,
      eventId: input.eventId,
      amount,
      commission,
      netAmount,
      message: input.message,
      paymentId,
      status: 'PENDING',
    },
  });

  return {
    tip: { id: tip.id, status: tip.status },
    payment: { paymentId, amount, method: 'SANDBOX', status: 'PENDING' },
    commission,
    netAmount,
    artistName: dj.artistName,
  };
}

export async function payTip(userId: string, tipId: string) {
  const tip = await prisma.tip.findUnique({ where: { id: tipId } });
  if (!tip) throw new AppError(404, 'Gorjeta não encontrada');
  if (tip.fromId !== userId) {
    throw new AppError(403, 'Gorjeta de outro usuário');
  }
  if (tip.status === 'PAID') {
    return { tipId, status: 'PAID', netAmount: tip.netAmount, alreadyPaid: true };
  }

  await prisma.tip.update({ where: { id: tipId }, data: { status: 'PAID' } });

  const dj = await prisma.dJ.findUnique({
    where: { id: tip.djId },
    select: { userId: true },
  });

  await recomputeScore(tip.djId);
  await awardAchievementByName(userId, MAO_ABERTA_SELO);

  if (dj) {
    await credit(dj.userId, tip.netAmount, 'TIP', 'Gorjeta recebida', {
      refType: 'tip',
      refId: tipId,
    });
    const extra = tip.message ? `\n"${tip.message}"` : '';
    await notifySafe(dj.userId, {
      type: 'SYSTEM',
      title: '💸 Gorjeta recebida',
      body: `Você recebeu R$ ${tip.netAmount.toFixed(2)} de gorjeta.${extra}`,
      data: { tipId, eventId: tip.eventId ?? undefined },
    });
  }

  return { tipId, status: 'PAID', netAmount: tip.netAmount, alreadyPaid: false };
}

export async function listMyTips(userId: string) {
  const sent = await prisma.tip.findMany({
    where: { fromId: userId },
    orderBy: { createdAt: 'desc' },
    include: { dj: { select: { artistName: true } } },
  });

  const myDJ = await prisma.dJ.findUnique({
    where: { userId },
    select: { id: true },
  });

  const receivedRaw = myDJ
    ? await prisma.tip.findMany({
        where: { djId: myDJ.id },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const fromIds = receivedRaw.map((t) => t.fromId);
  const fromUsers = fromIds.length
    ? await prisma.user.findMany({
        where: { id: { in: [...new Set(fromIds)] } },
        select: { id: true, name: true },
      })
    : [];
  const nameById = new Map(fromUsers.map((u) => [u.id, u.name]));

  return {
    sent: sent.map((t) => ({
      id: t.id,
      amount: t.amount,
      netAmount: t.netAmount,
      status: t.status,
      message: t.message,
      createdAt: t.createdAt,
      djName: t.dj.artistName,
    })),
    received: receivedRaw.map((t) => ({
      id: t.id,
      amount: t.amount,
      netAmount: t.netAmount,
      status: t.status,
      message: t.message,
      createdAt: t.createdAt,
      fromName: nameById.get(t.fromId) ?? 'Raver',
    })),
  };
}
