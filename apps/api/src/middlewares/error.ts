import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';
import { isProd } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Encaminha rejeições de handlers async para o errorHandler. */
export const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Rota não encontrada' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'campo';
    res.status(409).json({ error: `Já existe um registro com este ${target}.` });
    return;
  }

  logger.error(err instanceof Error ? `${err.message}\n${err.stack}` : String(err));
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
