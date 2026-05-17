import type { Gender } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { AppError } from '../middlewares/error';
import { checkConnectorSelos } from './selo.service';
import { notifySafe } from './notification.service';

async function notifyNewThran(superiorId: string, thranId: string) {
  const thran = await prisma.user.findUnique({
    where: { id: thranId },
    select: { name: true },
  });
  await notifySafe(superiorId, {
    type: 'THRAN',
    title: '🌱 Novo Thrän!',
    body: `${thran?.name ?? 'Alguém'} entrou na cena pelo seu vínculo.`,
    data: { thranId },
  });
}

const INVITE_MESSAGE =
  'A cena conecta quem o tempo separa. Encontre quem te inseriu nessa história.';

const PERSON_FIELDS = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
  gender: true,
} as const;

/** Termo do superior conforme o gênero de QUEM olha a árvore. */
function superiorTerm(viewerGender: Gender): 'DRÜN' | 'RHÄN' {
  return viewerGender === 'FEMININE' ? 'DRÜN' : 'RHÄN';
}

export async function createInvite(userId: string) {
  const now = new Date();

  const reusable = await prisma.inviteLink.findFirst({
    where: {
      userId,
      usedBy: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: 'desc' },
  });

  const invite =
    reusable ?? (await prisma.inviteLink.create({ data: { userId } }));

  return {
    code: invite.code,
    link: `${env.APP_PUBLIC_URL}/join/${invite.code}`,
    message: INVITE_MESSAGE,
  };
}

export async function getArvore(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gender: true,
      superior: { select: PERSON_FIELDS },
      thrans: { select: PERSON_FIELDS, orderBy: { createdAt: 'asc' } },
    },
  });

  if (!user) throw new AppError(404, 'Usuário não encontrado');

  return {
    superior: user.superior,
    superiorTerm: superiorTerm(user.gender),
    thrans: user.thrans,
    thranCount: user.thrans.length,
    message: user.superior ? null : INVITE_MESSAGE,
  };
}

/** Sobe a cadeia de superiores a partir de `startId` procurando `targetId`. */
async function wouldCreateCycle(startId: string, targetId: string): Promise<boolean> {
  let cursor: string | null = startId;
  for (let depth = 0; cursor && depth < 100; depth++) {
    if (cursor === targetId) return true;
    const node: { superiorId: string | null } | null = await prisma.user.findUnique({
      where: { id: cursor },
      select: { superiorId: true },
    });
    cursor = node?.superiorId ?? null;
  }
  return false;
}

export async function confirmSuperior(userId: string, inviteCode: string) {
  const invite = await prisma.inviteLink.findUnique({
    where: { code: inviteCode },
    include: { user: { select: PERSON_FIELDS } },
  });

  if (!invite || invite.usedBy) {
    throw new AppError(400, 'Link de convite inválido ou já utilizado');
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new AppError(400, 'Link de convite expirado');
  }
  if (invite.userId === userId) {
    throw new AppError(400, 'Você não pode usar o próprio link');
  }

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { superiorId: true, gender: true },
  });
  if (!me) throw new AppError(404, 'Usuário não encontrado');
  if (me.superiorId) {
    throw new AppError(409, 'Você já tem um superior na árvore');
  }
  if (await wouldCreateCycle(invite.userId, userId)) {
    throw new AppError(400, 'Esse vínculo criaria um ciclo na árvore');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { superiorId: invite.userId, pendingInviteCode: null },
    }),
    prisma.inviteLink.update({
      where: { id: invite.id },
      data: { usedBy: userId, usedAt: new Date() },
    }),
  ]);

  // Selos de conector vão para quem convidou (o novo superior).
  const awarded = await checkConnectorSelos(invite.userId);
  await notifyNewThran(invite.userId, userId);
  logger.info(`🌱 Novo Thrän confirmado para ${invite.userId} (via ${userId})`);

  return {
    superior: invite.user,
    superiorTerm: superiorTerm(me.gender),
    inviterSelosAwarded: awarded,
    message: 'Vínculo confirmado. A cena segue conectando.',
  };
}

/**
 * Gatilho automático da regra Drün/Rhän/Thrän: ao fazer o 1º checkin/selo,
 * se o usuário tem um `pendingInviteCode` e ainda não tem superior, o
 * vínculo é criado aqui. Silenciosamente limpa códigos inválidos.
 * Nunca lança — é chamado dentro de fluxos como o checkin.
 */
export async function autoConfirmFromPending(userId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { pendingInviteCode: true, superiorId: true, gender: true },
  });

  if (!me || me.superiorId || !me.pendingInviteCode) return null;

  const clearPending = () =>
    prisma.user.update({ where: { id: userId }, data: { pendingInviteCode: null } });

  const invite = await prisma.inviteLink.findUnique({
    where: { code: me.pendingInviteCode },
    include: { user: { select: PERSON_FIELDS } },
  });

  const invalid =
    !invite ||
    invite.usedBy ||
    invite.userId === userId ||
    (invite.expiresAt && invite.expiresAt < new Date());

  if (!invite || invalid) {
    await clearPending();
    return null;
  }

  if (await wouldCreateCycle(invite.userId, userId)) {
    await clearPending();
    return null;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { superiorId: invite.userId, pendingInviteCode: null },
    }),
    prisma.inviteLink.update({
      where: { id: invite.id },
      data: { usedBy: userId, usedAt: new Date() },
    }),
  ]);

  const awarded = await checkConnectorSelos(invite.userId);
  await notifyNewThran(invite.userId, userId);
  logger.info(`🌱 Thrän auto-confirmado para ${invite.userId} (via ${userId})`);

  return {
    superior: invite.user,
    superiorTerm: superiorTerm(me.gender),
    inviterSelosAwarded: awarded,
  };
}
