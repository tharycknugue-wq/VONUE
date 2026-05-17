import type { Request, Response } from 'express';
import { completeOnboardingSchema } from '../schemas/onboarding.schema';
import * as onboardingService from '../services/onboarding.service';
import { AppError } from '../middlewares/error';

export async function getQuestions(_req: Request, res: Response): Promise<void> {
  res.json(onboardingService.getQuestions());
}

export async function complete(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  const input = completeOnboardingSchema.parse(req.body);
  const result = await onboardingService.completeOnboarding(req.user.id, input);
  res.json(result);
}
