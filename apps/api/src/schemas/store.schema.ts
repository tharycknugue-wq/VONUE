import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  category: z.enum(['TICKET', 'CLOTHING', 'ACCESSORY', 'EQUIPMENT', 'OTHER']),
  images: z.array(z.string().url()).max(6).optional(),
  eventId: z.string().optional(),
});

export const listProductsQuerySchema = z.object({
  category: z
    .enum(['TICKET', 'CLOTHING', 'ACCESSORY', 'EQUIPMENT', 'OTHER'])
    .optional(),
  q: z.string().min(1).optional(),
  eventId: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, 'Adicione ao menos um item'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
