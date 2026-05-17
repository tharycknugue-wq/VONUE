import { z } from 'zod';

export const withdrawSchema = z.object({
  amount: z.number().positive().min(1, 'Mínimo R$ 1'),
});
