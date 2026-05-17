import { z } from 'zod';

export const ticketTypeInputSchema = z.object({
  name: z.string().min(1).max(60),
  price: z.number().min(0),
  quantity: z.number().int().positive(),
});

export const createTicketTypesSchema = z.object({
  ticketTypes: z.array(ticketTypeInputSchema).min(1).max(20),
});

export const purchaseSchema = z.object({
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
  method: z.enum(['PIX', 'CARD']),
  promoterCode: z.string().min(1).optional(),
});

export const enrollPromoterSchema = z.object({
  username: z.string().min(1),
  commission: z.number().min(0).max(0.5).optional(),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1),
});

export const ticketCheckinSchema = z.object({
  qrCode: z.string().min(1),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
