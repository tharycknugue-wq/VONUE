import { z } from 'zod';
import { ONBOARDING_QUESTIONS } from '../data/onboardingQuestions';

export const completeOnboardingSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.string().min(1),
      })
    )
    .min(ONBOARDING_QUESTIONS.length, 'Responda todas as perguntas')
    .max(ONBOARDING_QUESTIONS.length, 'Há respostas a mais'),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
