import { z } from 'zod';

export const registerTokenSchema = z.object({
  token: z.string().min(1, 'Token do dispositivo obrigatório'),
});
