import type { Request, Response } from 'express';
import { registerSchema, loginSchema, refreshSchema, verifyCpfSchema } from '../schemas/auth.schema';
import * as authService from '../services/auth.service';
import { verifyRefreshToken } from '../utils/jwt';
import { isValidCpf, sanitizeCpf } from '../utils/cpf';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.json(result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = refreshSchema.parse(req.body);
  let userId: string;
  try {
    userId = verifyRefreshToken(refreshToken).userId;
  } catch {
    throw new AppError(401, 'Refresh token inválido ou expirado');
  }
  const result = await authService.refresh(userId);
  res.json(result);
}

export async function verifyCpf(req: Request, res: Response): Promise<void> {
  const { cpf } = verifyCpfSchema.parse(req.body);
  const normalized = sanitizeCpf(cpf);
  const validFormat = isValidCpf(normalized);

  const taken = validFormat
    ? (await prisma.user.count({ where: { cpf: normalized } })) > 0
    : false;

  res.json({
    cpf: normalized,
    valid: validFormat && !taken,
    validFormat,
    available: !taken,
  });
}
