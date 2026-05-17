import type { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
}

/**
 * Envio de push. Em produção, com FCM_SERVER_KEY definido, dispara para o
 * token do dispositivo (Firebase Cloud Messaging). Sem a chave (sandbox),
 * apenas registra — o inbox persistido é a fonte de verdade. Nunca lança.
 */
async function sendPush(fcmToken: string | null, input: NotifyInput): Promise<void> {
  if (!fcmToken) return;
  const serverKey = process.env.FCM_SERVER_KEY;

  if (!serverKey) {
    logger.debug(`[push:sandbox] ${input.title} — ${input.body}`);
    return;
  }

  try {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title: input.title, body: input.body },
        data: input.data ?? {},
        priority: 'high',
      }),
    });
  } catch (e) {
    logger.warn(`Falha ao enviar push: ${e instanceof Error ? e.message : e}`);
  }
}

export async function notify(userId: string, input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });
  void sendPush(user?.fcmToken ?? null, input); // fire-and-forget

  return notification;
}

/** Versão que nunca quebra o fluxo chamador (árvore, selos, NFC, pedidos). */
export async function notifySafe(userId: string, input: NotifyInput): Promise<void> {
  try {
    await notify(userId, input);
  } catch (e) {
    logger.warn(`notifySafe falhou: ${e instanceof Error ? e.message : e}`);
  }
}

export async function listNotifications(userId: string, unreadOnly: boolean) {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);
  return { unreadCount, total: items.length, notifications: items };
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markRead(userId: string, id: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  return { id, read: true };
}

export async function markAllRead(userId: string) {
  const res = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return { updated: res.count };
}

export async function registerToken(userId: string, token: string) {
  await prisma.user.update({ where: { id: userId }, data: { fcmToken: token } });
  return { registered: true };
}
