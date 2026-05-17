import { z } from 'zod';
import { ticketTypeInputSchema } from './ticket.schema';

export const createEventSchema = z
  .object({
    name: z.string().min(3, 'Nome muito curto').max(120),
    description: z.string().max(2000).optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    styles: z.array(z.string().min(1)).min(1, 'Informe ao menos um estilo'),
    capacity: z.number().int().positive().optional(),
    venue: z.object({
      name: z.string().min(2).max(120),
      address: z.string().min(3).max(200),
      city: z.string().min(2).max(60),
      state: z.string().min(2).max(2),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      capacity: z.number().int().positive().optional(),
    }),
    ticketTypes: z.array(ticketTypeInputSchema).max(20).optional(),
  })
  .refine((d) => !d.endDate || d.endDate >= d.date, {
    message: 'endDate deve ser após date',
    path: ['endDate'],
  });

export const listEventsQuerySchema = z.object({
  scope: z.enum(['upcoming', 'past', 'all']).optional(),
  city: z.string().min(1).optional(),
  style: z.string().min(1).optional(),
});

export const checkinSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
