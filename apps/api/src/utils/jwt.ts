import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string; // userId
  username: string;
}

interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' } satisfies RefreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Token inválido');
  }
  return { sub: String(decoded.sub), username: String((decoded as jwt.JwtPayload).username) };
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === 'string' || decoded.type !== 'refresh' || !decoded.sub) {
    throw new Error('Refresh token inválido');
  }
  return { userId: String(decoded.sub) };
}

export function issueTokenPair(payload: AccessPayload) {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload.sub),
  };
}
