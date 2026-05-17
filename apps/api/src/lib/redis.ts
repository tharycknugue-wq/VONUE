import { createClient, type RedisClientType } from 'redis';
import { env } from '../config/env';
import { logger } from './logger';

// Cliente Redis com conexão preguiçosa. A fatia vertical (auth/onboarding)
// não depende do Redis; ele será usado por mapa em tempo real, filas e
// sessões nas próximas features.
let client: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (client?.isOpen) return client;

  client = createClient({ url: env.REDIS_URL });
  client.on('error', (err) => logger.error(`Redis: ${err}`));
  await client.connect();
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) await client.quit();
  client = null;
}
