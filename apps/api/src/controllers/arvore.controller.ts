import type { Request, Response } from 'express';
import * as arvoreService from '../services/arvore.service';
import { confirmSuperiorSchema } from '../schemas/arvore.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function createInvite(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.status(201).json(await arvoreService.createInvite(user.id));
}

export async function getArvore(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await arvoreService.getArvore(user.id));
}

export async function confirmSuperior(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { inviteCode } = confirmSuperiorSchema.parse(req.body);
  res.json(await arvoreService.confirmSuperior(user.id, inviteCode));
}
