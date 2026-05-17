import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { registerTokenSchema } from '../schemas/notification.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function list(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const unreadOnly = req.query.unread === 'true';
  res.json(await notificationService.listNotifications(user.id, unreadOnly));
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await notificationService.markRead(user.id, req.params.id));
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await notificationService.markAllRead(user.id));
}

export async function registerToken(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { token } = registerTokenSchema.parse(req.body);
  res.json(await notificationService.registerToken(user.id, token));
}
