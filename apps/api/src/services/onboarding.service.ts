import { NucleoType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import {
  ONBOARDING_QUESTIONS,
  publicQuestions,
} from '../data/onboardingQuestions';
import { scoresFromGenres } from '../data/genres';
import { calculateNucleo } from '../utils/nucleo';
import type { CompleteOnboardingInput } from '../schemas/onboarding.schema';

export function getQuestions() {
  return { total: ONBOARDING_QUESTIONS.length, questions: publicQuestions() };
}

export async function completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput
) {
  const { partials, forceFarofeiro, validCount } = scoresFromGenres(
    input.genres
  );
  if (validCount === 0) {
    throw new AppError(422, 'Selecione ao menos um estilo válido');
  }

  const calc = calculateNucleo(partials);
  const scores = calc.scores;
  // "Curte tudo sem rótulo" vence quando escolhe farofeiro ou 5+ estilos.
  const nucleoType = forceFarofeiro ? NucleoType.FAROFEIRO : calc.nucleoType;

  const [result] = await prisma.$transaction([
    prisma.onboardingResult.upsert({
      where: { userId },
      create: { userId, answers: { genres: input.genres }, scores, nucleoType },
      update: {
        answers: { genres: input.genres },
        scores,
        nucleoType,
        completedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { nucleoType, nucleoScore: scores },
    }),
  ]);

  return { nucleoType, scores, completedAt: result.completedAt };
}
