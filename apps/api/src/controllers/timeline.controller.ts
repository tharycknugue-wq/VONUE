import type { Request, Response } from 'express';
import * as timelineService from '../services/timeline.service';
import { AppError } from '../middlewares/error';

export async function get(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  const items = await timelineService.getTimeline(req.user.id);
  res.json({ total: items.length, items });
}
