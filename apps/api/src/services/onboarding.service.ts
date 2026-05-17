import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import {
  ONBOARDING_QUESTIONS,
  resolveAnswerScores,
  publicQuestions,
} from '../data/onboardingQuestions';
import { calculateNucleo, type Scores } from '../utils/nucleo';
import type { CompleteOnboardingInput } from '../schemas/onboarding.schema';

export function getQuestions() {
  return { total: ONBOARDING_QUESTIONS.length, questions: publicQuestions() };
}

export async function completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput
) {
  const seen = new Set<string>();
  const partials: Array<Partial<Scores>> = [];

  for (const answer of input.answers) {
    if (seen.has(answer.questionId)) {
      throw new AppError(422, `Pergunta ${answer.questionId} respondida em duplicidade`);
    }
    seen.add(answer.questionId);

    const scores = resolveAnswerScores(answer.questionId, answer.optionId);
    if (!scores) {
      throw new AppError(422, `Resposta inválida para ${answer.questionId}`);
    }
    partials.push(scores);
  }

  for (const question of ONBOARDING_QUESTIONS) {
    if (!seen.has(question.id)) {
      throw new AppError(422, `Pergunta ${question.id} não foi respondida`);
    }
  }

  const { scores, nucleoType } = calculateNucleo(partials);

  const [result] = await prisma.$transaction([
    prisma.onboardingResult.upsert({
      where: { userId },
      create: { userId, answers: input.answers, scores, nucleoType },
      update: { answers: input.answers, scores, nucleoType, completedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { nucleoType, nucleoScore: scores },
    }),
  ]);

  return { nucleoType, scores, completedAt: result.completedAt };
}
