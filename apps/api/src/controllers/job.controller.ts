import type { Request, Response } from 'express';
import * as jobService from '../services/job.service';
import * as reviewService from '../services/review.service';
import { postJobSchema, applyJobSchema } from '../schemas/job.schema';
import { createReviewSchema } from '../schemas/review.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function post(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = postJobSchema.parse(req.body);
  res.status(201).json(await jobService.postJob(user.id, req.params.id, input));
}

export async function listOpen(_req: Request, res: Response): Promise<void> {
  res.json({ jobs: await jobService.listOpenJobs() });
}

export async function listForEvent(req: Request, res: Response): Promise<void> {
  res.json({ jobs: await jobService.listEventJobs(req.params.id) });
}

export async function detail(req: Request, res: Response): Promise<void> {
  res.json(await jobService.getJob(req.user?.id ?? null, req.params.id));
}

export async function apply(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { message } = applyJobSchema.parse(req.body ?? {});
  res.status(201).json(await jobService.apply(user.id, req.params.id, message));
}

export async function accept(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await jobService.acceptApplication(user.id, req.params.id));
}

export async function review(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createReviewSchema.parse(req.body);
  res
    .status(201)
    .json(await reviewService.reviewFreelancer(user.id, req.params.id, input));
}

export async function reviews(req: Request, res: Response): Promise<void> {
  res.json(await reviewService.freelancerReviews(req.params.id));
}
