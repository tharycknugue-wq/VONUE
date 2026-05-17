import { z } from 'zod';

export const confirmSuperiorSchema = z.object({
  inviteCode: z.string().min(1, 'Informe o código do convite'),
});

export type ConfirmSuperiorInput = z.infer<typeof confirmSuperiorSchema>;
