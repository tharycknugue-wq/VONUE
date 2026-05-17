import { z } from 'zod';
import { isAdult } from '../utils/age';
import { isValidCpf } from '../utils/cpf';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-z0-9_.]+$/, 'Use apenas letras minúsculas, números, _ e .'),
  name: z.string().min(2, 'Informe seu nome').max(80),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres').max(72),
  gender: z.enum(['MASCULINE', 'FEMININE']),
  birthDate: z.coerce
    .date()
    .refine((d) => isAdult(d), 'É necessário ter 18 anos ou mais'),
  phone: z.string().min(8).max(20).optional(),
  cpf: z
    .string()
    .optional()
    .refine((v) => v === undefined || isValidCpf(v), 'CPF inválido'),
  city: z.string().max(60).optional(),
  state: z.string().max(2).optional(),
  bio: z.string().max(280).optional(),
  inviteCode: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Informe e-mail ou usuário'),
  password: z.string().min(1, 'Informe a senha'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken obrigatório'),
});

export const verifyCpfSchema = z.object({
  cpf: z.string().min(1, 'Informe o CPF'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
