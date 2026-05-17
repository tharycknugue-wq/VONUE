import { z } from 'zod';

export const uploadPhotoSchema = z.object({
  imageUrl: z.string().url('Informe uma URL de imagem válida'),
  thumbnailUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  tagUserIds: z.array(z.string().min(1)).max(50).optional(),
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;
