import type { Request, Response } from 'express';
import * as photoService from '../services/photo.service';
import * as reviewService from '../services/review.service';
import { uploadPhotoSchema } from '../schemas/photo.schema';
import { createReviewSchema } from '../schemas/review.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function upload(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = uploadPhotoSchema.parse(req.body);
  res
    .status(201)
    .json(await photoService.uploadPhoto(user.id, req.params.id, input));
}

export async function listEvent(req: Request, res: Response): Promise<void> {
  res.json({ photos: await photoService.listEventPhotos(req.params.id) });
}

export async function tagged(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const tags = await photoService.listTaggedPhotos(user.id);
  res.json({ total: tags.length, tags });
}

export async function approveTag(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await photoService.setTagStatus(user.id, req.params.id, 'APPROVED'));
}

export async function rejectTag(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await photoService.setTagStatus(user.id, req.params.id, 'REJECTED'));
}

export async function reviewPhotographer(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createReviewSchema.parse(req.body);
  res
    .status(201)
    .json(await reviewService.reviewPhotographer(user.id, req.params.id, input));
}

export async function photographerReviews(req: Request, res: Response): Promise<void> {
  res.json(await reviewService.photographerReviews(req.params.id));
}
