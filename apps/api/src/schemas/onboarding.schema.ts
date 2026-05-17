import { z } from 'zod';

// Onboarding agora é seleção livre de estilos (múltipla escolha, sem
// limite). O cliente envia os ids dos estilos; a API mapeia → núcleo.
export const completeOnboardingSchema = z.object({
  genres: z
    .array(z.string().min(1))
    .min(1, 'Selecione ao menos um estilo'),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
