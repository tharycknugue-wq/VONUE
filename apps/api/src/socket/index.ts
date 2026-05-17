import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { registerMapHandlers } from './mapHandler';
import type { SocketData } from './types';

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Token não fornecido'));

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, nucleoType: true },
      });
      if (!user) return next(new Error('Usuário não encontrado'));

      const data: SocketData = {
        userId: user.id,
        name: user.name,
        nucleoType: user.nucleoType,
        events: new Set(),
        ghost: new Set(),
      };
      socket.data = data;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`socket conectado: ${(socket.data as SocketData).userId}`);
    registerMapHandlers(socket);
  });

  return io;
}
