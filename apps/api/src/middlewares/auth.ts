import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './error';

export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new AppError(401, 'Token não fornecido');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    throw new AppError(401, 'Token inválido ou expirado');
  }
}

/** Popula req.user se houver token válido; nunca bloqueia a requisição. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, username: payload.username };
    } catch {
      /* token inválido — segue anônimo */
    }
  }
  next();
}
