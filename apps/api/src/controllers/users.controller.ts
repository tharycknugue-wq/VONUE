import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AppError } from '../middlewares/error';

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  const profile = await authService.getProfile(req.user.id);
  res.json(profile);
}
