import type { Request, Response } from 'express';
import * as promoterService from '../services/promoter.service';
import * as reviewService from '../services/review.service';
import { enrollPromoterSchema } from '../schemas/ticket.schema';
import { createReviewSchema } from '../schemas/review.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function enroll(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { username, commission } = enrollPromoterSchema.parse(req.body);
  res
    .status(201)
    .json(
      await promoterService.enrollPromoter(user.id, req.params.id, username, commission)
    );
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await promoterService.myPromoter(user.id));
}

export async function review(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createReviewSchema.parse(req.body);
  res
    .status(201)
    .json(await reviewService.reviewPromoter(user.id, req.params.id, input));
}

export async function reviews(req: Request, res: Response): Promise<void> {
  res.json(await reviewService.promoterReviews(req.params.id));
}
