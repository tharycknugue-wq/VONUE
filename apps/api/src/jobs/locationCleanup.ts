import { prisma } from '../lib/prisma';
import { purgeEventLocations } from '../services/map.service';

// Eventos encerrados nos últimos 7 dias — os mais antigos já foram limpos.
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Remove do Redis a localização ao vivo de eventos já encerrados. */
export async function locationCleanup(): Promise<string> {
  const now = Date.now();
  const events = await prisma.event.findMany({
    where: { endDate: { lt: new Date(now), gt: new Date(now - WINDOW_MS) } },
    select: { id: true },
  });

  let purged = 0;
  for (const e of events) {
    if (await purgeEventLocations(e.id)) purged += 1;
  }
  return `${events.length} evento(s) verificado(s), ${purged} mapa(s) limpo(s)`;
}
