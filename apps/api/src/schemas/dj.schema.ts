import { z } from 'zod';

export const createDJSchema = z.object({
  artistName: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  style: z.array(z.string().min(1)).min(1, 'Informe ao menos um estilo').max(8),
  bpm: z.number().int().min(60).max(220).optional(),
  country: z.string().max(40).optional(),
  socialLinks: z.record(z.string()).optional(),
});

export const addLineupSchema = z.object({
  djId: z.string().min(1),
  order: z.number().int().min(0),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
});

export type CreateDJInput = z.infer<typeof createDJSchema>;
export type AddLineupInput = z.infer<typeof addLineupSchema>;
