import { SeloType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { notifySafe } from './notification.service';

/**
 * Verifica e concede os Selos de Conector ao usuário conforme a
 * quantidade de Thräns confirmados. Idempotente (upsert por userId+seloId).
 * Reaproveitável pelo trigger de checkin/selo futuramente.
 */
export async function checkConnectorSelos(userId: string): Promise<string[]> {
  const thranCount = await prisma.user.count({ where: { superiorId: userId } });

  const connectorSelos = await prisma.selo.findMany({
    where: { type: SeloType.CONNECTOR },
  });

  const awarded: string[] = [];

  for (const selo of connectorSelos) {
    const criteria = selo.criteria as { minThrans?: number } | null;
    const min = criteria?.minThrans ?? Number.POSITIVE_INFINITY;
    if (thranCount < min) continue;

    const result = await prisma.userSelo.upsert({
      where: { userId_seloId: { userId, seloId: selo.id } },
      create: { userId, seloId: selo.id, metadata: { thranCount } },
      update: {},
      include: { selo: { select: { name: true } } },
    });

    // upsert não diz se criou; checamos pela proximidade de earnedAt.
    if (Date.now() - result.earnedAt.getTime() < 5_000) {
      awarded.push(selo.name);
      logger.info(`🏅 Selo de conector "${selo.name}" concedido a ${userId}`);
      await notifySafe(userId, {
        type: 'SELO',
        title: '🏅 Novo selo!',
        body: `Você conquistou "${selo.emoji} ${selo.name}".`,
        data: { seloId: selo.id },
      });
    }
  }

  return awarded;
}

/**
 * Concede um selo ACHIEVEMENT pelo nome (idempotente). Retorna true se
 * foi concedido agora. No-op silencioso se o selo não existir no banco.
 */
export async function awardAchievementByName(
  userId: string,
  name: string
): Promise<boolean> {
  const selo = await prisma.selo.findFirst({
    where: { name, type: SeloType.ACHIEVEMENT },
    select: { id: true, name: true, emoji: true },
  });
  if (!selo) return false;

  const res = await prisma.userSelo.upsert({
    where: { userId_seloId: { userId, seloId: selo.id } },
    create: { userId, seloId: selo.id },
    update: {},
    select: { earnedAt: true },
  });

  const justAwarded = Date.now() - res.earnedAt.getTime() < 5_000;
  if (justAwarded) {
    await notifySafe(userId, {
      type: 'SELO',
      title: '🏅 Novo selo!',
      body: `Você conquistou "${selo.emoji} ${selo.name}".`,
      data: { seloId: selo.id },
    });
  }
  return justAwarded;
}

export function listUserSelos(userId: string) {
  return prisma.userSelo.findMany({
    where: { userId },
    orderBy: { earnedAt: 'desc' },
    include: {
      selo: {
        select: { name: true, emoji: true, description: true, type: true, imageUrl: true },
      },
    },
  });
}
