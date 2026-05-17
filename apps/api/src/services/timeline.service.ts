import { prisma } from '../lib/prisma';

export type TimelineType =
  | 'CHECKIN'
  | 'SELO'
  | 'NFC'
  | 'TIP_SENT'
  | 'TIP_RECEIVED'
  | 'ORDER'
  | 'PHOTO';

export interface TimelineItem {
  id: string;
  type: TimelineType;
  icon: string;
  title: string;
  subtitle?: string;
  at: string; // ISO
}

const PER_SOURCE = 40;
const MAX_ITEMS = 60;

/**
 * Read-model: agrega a vida do usuário na cena (check-ins, selos, conexões,
 * gorjetas, pedidos, fotos) num feed único ordenado por data desc.
 */
export async function getTimeline(userId: string): Promise<TimelineItem[]> {
  const myDJ = await prisma.dJ.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [checkins, selos, nfc, tipsSent, tipsReceived, orders, photos] =
    await Promise.all([
      prisma.checkin.findMany({
        where: { userId },
        orderBy: { checkedAt: 'desc' },
        take: PER_SOURCE,
        include: { event: { select: { name: true } } },
      }),
      prisma.userSelo.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
        take: PER_SOURCE,
        include: { selo: { select: { name: true, emoji: true } } },
      }),
      prisma.nFCConnection.findMany({
        where: {
          status: { not: 'REJECTED' },
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { connectedAt: 'desc' },
        take: PER_SOURCE,
        include: {
          sender: { select: { name: true } },
          receiver: { select: { name: true } },
        },
      }),
      prisma.tip.findMany({
        where: { fromId: userId, status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        take: PER_SOURCE,
        include: { dj: { select: { artistName: true } } },
      }),
      myDJ
        ? prisma.tip.findMany({
            where: { djId: myDJ.id, status: 'PAID' },
            orderBy: { createdAt: 'desc' },
            take: PER_SOURCE,
          })
        : Promise.resolve([]),
      prisma.order.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        take: PER_SOURCE,
        include: { items: { include: { product: { select: { name: true } } } } },
      }),
      prisma.photoTag.findMany({
        where: { userId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: PER_SOURCE,
        include: { photo: { select: { event: { select: { name: true } } } } },
      }),
    ]);

  const items: TimelineItem[] = [];

  for (const c of checkins) {
    items.push({
      id: `checkin:${c.id}`,
      type: 'CHECKIN',
      icon: '🎉',
      title: `Check-in em ${c.event.name}`,
      at: c.checkedAt.toISOString(),
    });
  }

  for (const s of selos) {
    items.push({
      id: `selo:${s.id}`,
      type: 'SELO',
      icon: s.selo.emoji,
      title: `Selo conquistado: ${s.selo.name}`,
      at: s.earnedAt.toISOString(),
    });
  }

  for (const n of nfc) {
    const other = n.senderId === userId ? n.receiver.name : n.sender.name;
    items.push({
      id: `nfc:${n.id}`,
      type: 'NFC',
      icon: '📲',
      title: `Conexão com ${other}`,
      at: n.connectedAt.toISOString(),
    });
  }

  for (const t of tipsSent) {
    items.push({
      id: `tipout:${t.id}`,
      type: 'TIP_SENT',
      icon: '🪙',
      title: `Gorjeta para ${t.dj.artistName}`,
      subtitle: `R$ ${t.amount.toFixed(2)}`,
      at: t.createdAt.toISOString(),
    });
  }

  if (tipsReceived.length > 0) {
    const fromIds = [...new Set(tipsReceived.map((t) => t.fromId))];
    const users = await prisma.user.findMany({
      where: { id: { in: fromIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(users.map((u) => [u.id, u.name]));
    for (const t of tipsReceived) {
      items.push({
        id: `tipin:${t.id}`,
        type: 'TIP_RECEIVED',
        icon: '💸',
        title: `Gorjeta de ${nameById.get(t.fromId) ?? 'Raver'}`,
        subtitle: `+ R$ ${t.netAmount.toFixed(2)}`,
        at: t.createdAt.toISOString(),
      });
    }
  }

  for (const o of orders) {
    const desc = o.items
      .map((i) => `${i.quantity}× ${i.product.name}`)
      .join(', ');
    items.push({
      id: `order:${o.id}`,
      type: 'ORDER',
      icon: '🛍️',
      title: `Pedido: ${desc}`,
      subtitle: `R$ ${o.total.toFixed(2)} · ${o.status}`,
      at: o.createdAt.toISOString(),
    });
  }

  for (const p of photos) {
    items.push({
      id: `photo:${p.id}`,
      type: 'PHOTO',
      icon: '🎞️',
      title: `Eternizado numa foto de ${p.photo.event.name}`,
      at: p.createdAt.toISOString(),
    });
  }

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, MAX_ITEMS);
}
