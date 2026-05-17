import type { Request, Response } from 'express';
import * as mapService from '../services/map.service';
import { AppError } from '../middlewares/error';

export async function eventSnapshot(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  const eventId = req.params.id;
  await mapService.requireCheckin(req.user.id, eventId);
  const peers = await mapService.snapshot(eventId);
  res.json({ eventId, total: peers.length, peers });
}
