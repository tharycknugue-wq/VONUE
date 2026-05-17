import { z } from 'zod';

export const createTipSchema = z.object({
  amount: z.number().positive().min(1, 'Mínimo R$ 1').max(100000),
  eventId: z.string().optional(),
  message: z.string().max(280).optional(),
});

export type CreateTipInput = z.infer<typeof createTipSchema>;
