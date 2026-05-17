import type { Request, Response } from 'express';
import * as walletService from '../services/wallet.service';
import { withdrawSchema } from '../schemas/wallet.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function get(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await walletService.getWallet(user.id));
}

export async function withdraw(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { amount } = withdrawSchema.parse(req.body);
  res.json(await walletService.withdraw(user.id, amount));
}
