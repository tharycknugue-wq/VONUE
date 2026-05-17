import type { Request, Response } from 'express';
import * as tipService from '../services/tip.service';
import { createTipSchema } from '../schemas/tip.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createTipSchema.parse(req.body);
  res.status(201).json(await tipService.createTip(user.id, req.params.id, input));
}

export async function pay(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await tipService.payTip(user.id, req.params.id));
}

export async function mine(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await tipService.listMyTips(user.id));
}
