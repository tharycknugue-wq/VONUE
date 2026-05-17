import { prisma } from '../lib/prisma';

const MIN_QUERY = 2;
const PER_KIND = 12;

export interface SearchResults {
  query: string;
  events: Array<{
    id: string;
    name: string;
    date: Date;
    city: string;
    state: string;
  }>;
  djs: Array<{
    id: string;
    artistName: string;
    style: string[];
    rankScore: number;
  }>;
  products: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

/**
 * Descoberta global: eventos publicados, DJs e produtos ativos por nome.
 * Read-model — sem schema novo. Consultas em paralelo, limitadas.
 */
export async function search(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim();
  if (query.length < MIN_QUERY) {
    return { query, events: [], djs: [], products: [] };
  }
  const contains = { contains: query, mode: 'insensitive' as const };

  const [events, djs, products] = await Promise.all([
    prisma.event.findMany({
      where: {
        isPublished: true,
        OR: [{ name: contains }, { venue: { city: contains } }],
      },
      orderBy: { date: 'asc' },
      take: PER_KIND,
      select: {
        id: true,
        name: true,
        date: true,
        venue: { select: { city: true, state: true } },
      },
    }),
    prisma.dJ.findMany({
      where: { artistName: contains },
      orderBy: { rankScore: 'desc' },
      take: PER_KIND,
      select: { id: true, artistName: true, style: true, rankScore: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, name: contains },
      orderBy: { createdAt: 'desc' },
      take: PER_KIND,
      select: { id: true, name: true, price: true },
    }),
  ]);

  return {
    query,
    events: events.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      city: e.venue.city,
      state: e.venue.state,
    })),
    djs,
    products,
  };
}
