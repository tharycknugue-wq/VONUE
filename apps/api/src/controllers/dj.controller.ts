import type { Request, Response } from 'express';
import * as djService from '../services/dj.service';
import * as reviewService from '../services/review.service';
import { createDJSchema, addLineupSchema } from '../schemas/dj.schema';
import { createReviewSchema } from '../schemas/review.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function become(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createDJSchema.parse(req.body);
  res.status(201).json(await djService.becomeDJ(user.id, input));
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json({ dj: await djService.getMyDJ(user.id) });
}

export async function list(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  res.json({ djs: await djService.listDJs(req.user?.id ?? null, q) });
}

export async function detail(req: Request, res: Response): Promise<void> {
  res.json(await djService.getDJ(req.user?.id ?? null, req.params.id));
}

export async function follow(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await djService.follow(user.id, req.params.id));
}

export async function unfollow(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await djService.unfollow(user.id, req.params.id));
}

export async function addLineup(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = addLineupSchema.parse(req.body);
  res.status(201).json(await djService.addLineup(user.id, req.params.id, input));
}

export async function review(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createReviewSchema.parse(req.body);
  res.status(201).json(await reviewService.reviewDJ(user.id, req.params.id, input));
}

export async function reviews(req: Request, res: Response): Promise<void> {
  res.json(await reviewService.djReviews(req.params.id));
}
