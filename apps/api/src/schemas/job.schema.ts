import { z } from 'zod';

export const postJobSchema = z.object({
  role: z.enum([
    'DJ',
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'SOUND_TECH',
    'LIGHT_TECH',
    'BARTENDER',
    'SECURITY',
    'STRUCTURE',
    'FREELANCER',
  ]),
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  budget: z.number().min(0).optional(),
});

export const applyJobSchema = z.object({
  message: z.string().max(500).optional(),
});

export type PostJobInput = z.infer<typeof postJobSchema>;
