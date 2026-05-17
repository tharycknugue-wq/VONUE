import type { Request, Response } from 'express';
import * as seloService from '../services/selo.service';
import { AppError } from '../middlewares/error';

export async function mine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  const selos = await seloService.listUserSelos(req.user.id);
  res.json({ total: selos.length, selos });
}
