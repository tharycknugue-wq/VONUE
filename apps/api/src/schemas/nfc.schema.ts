import { z } from 'zod';

export const nfcConnectSchema = z.object({
  token: z.string().min(1, 'Informe o código da etiqueta NFC'),
});
