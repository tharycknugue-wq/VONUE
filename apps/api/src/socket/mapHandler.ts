import type { Socket } from 'socket.io';
import { logger } from '../lib/logger';
import * as mapService from '../services/map.service';
import type { SocketData } from './types';

const room = (eventId: string) => `map:${eventId}`;

export function registerMapHandlers(socket: Socket): void {
  const data = socket.data as SocketData;
  const fail = (message: string) => socket.emit('map:error', { message });

  async function leave(eventId: string): Promise<void> {
    data.events.delete(eventId);
    socket.leave(room(eventId));
    try {
      await mapService.removeLocation(eventId, data.userId);
    } catch {
      /* Redis pode estar fora — ignora na saída */
    }
    socket.to(room(eventId)).emit('map:peer-left', { userId: data.userId });
  }

  socket.on('map:join', async ({ eventId }: { eventId: string }) => {
    try {
      await mapService.requireCheckin(data.userId, eventId);
      socket.join(room(eventId));
      data.events.add(eventId);
      const peers = await mapService.snapshot(eventId);
      socket.emit('map:snapshot', { eventId, peers });
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Erro ao entrar no mapa');
    }
  });

  socket.on(
    'map:location',
    async ({ eventId, lat, lng }: { eventId: string; lat: number; lng: number }) => {
      if (!data.events.has(eventId) || data.ghost.has(eventId)) return;
      const peer: mapService.LivePeer = {
        userId: data.userId,
        name: data.name,
        nucleoType: data.nucleoType,
        lat,
        lng,
        updatedAt: Date.now(),
      };
      try {
        await mapService.upsertLocation(eventId, peer);
        socket.to(room(eventId)).emit('map:peer', peer);
      } catch (e) {
        fail(e instanceof Error ? e.message : 'Erro ao atualizar localização');
      }
    }
  );

  socket.on(
    'map:ghost',
    async ({ eventId, enabled }: { eventId: string; enabled: boolean }) => {
      if (enabled) {
        data.ghost.add(eventId);
        try {
          await mapService.removeLocation(eventId, data.userId);
        } catch {
          /* ignora */
        }
        socket.to(room(eventId)).emit('map:peer-left', { userId: data.userId });
      } else {
        data.ghost.delete(eventId);
      }
    }
  );

  socket.on('map:leave', async ({ eventId }: { eventId: string }) => {
    await leave(eventId);
  });

  socket.on('disconnect', async () => {
    for (const eventId of [...data.events]) await leave(eventId);
    logger.debug(`socket desconectado: ${data.userId}`);
  });
}
