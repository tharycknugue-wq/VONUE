import { prisma } from '../lib/prisma';
import { getRedis } from '../lib/redis';
import { AppError } from '../middlewares/error';

// Localização ao vivo de quem está no evento. Guardada em um hash Redis
// por evento (`map:{eventId}`), campo = userId. Sem TTL por campo —
// a obsolescência é tratada por `updatedAt` no payload.
const STALE_MS = 60_000;

export interface LivePeer {
  userId: string;
  name: string;
  nucleoType: string | null;
  lat: number;
  lng: number;
  updatedAt: number;
}

const keyFor = (eventId: string) => `map:${eventId}`;

async function redis() {
  try {
    return await getRedis();
  } catch {
    throw new AppError(503, 'Serviço de mapa indisponível (Redis).');
  }
}

/** Só quem fez check-in no evento entra/aparece no mapa. */
export async function requireCheckin(userId: string, eventId: string): Promise<void> {
  const checkin = await prisma.checkin.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { id: true },
  });
  if (!checkin) {
    throw new AppError(403, 'Faça check-in no evento para entrar no mapa.');
  }
}

export async function upsertLocation(eventId: string, peer: LivePeer): Promise<void> {
  const client = await redis();
  await client.hSet(keyFor(eventId), peer.userId, JSON.stringify(peer));
}

export async function removeLocation(eventId: string, userId: string): Promise<void> {
  const client = await redis();
  await client.hDel(keyFor(eventId), userId);
}

/** Snapshot atual do evento, descartando (e limpando) entradas obsoletas. */
export async function snapshot(eventId: string): Promise<LivePeer[]> {
  const client = await redis();
  const raw = await client.hGetAll(keyFor(eventId));
  const now = Date.now();
  const fresh: LivePeer[] = [];
  const stale: string[] = [];

  for (const [userId, value] of Object.entries(raw)) {
    try {
      const peer = JSON.parse(value) as LivePeer;
      if (now - peer.updatedAt > STALE_MS) stale.push(userId);
      else fresh.push(peer);
    } catch {
      stale.push(userId);
    }
  }

  if (stale.length) await client.hDel(keyFor(eventId), stale);
  return fresh;
}

/**
 * Remove o hash de localização de um evento (encerrado). Seguro para jobs:
 * não lança se o Redis estiver indisponível. Retorna true se apagou algo.
 */
export async function purgeEventLocations(eventId: string): Promise<boolean> {
  try {
    const client = await getRedis();
    const removed = await client.del(keyFor(eventId));
    return removed > 0;
  } catch {
    return false;
  }
}
