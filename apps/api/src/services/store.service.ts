import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';
import { credit } from './wallet.service';
import type { CreateProductInput, CreateOrderInput } from '../schemas/store.schema';

// Comissão: 10% para produtos de evento, 12% para terceiros.
const COMMISSION_EVENT = 0.1;
const COMMISSION_THIRD = 0.12;
// Liberação automática do escrow após 48h sem disputa.
const AUTO_RELEASE_MS = 48 * 60 * 60 * 1000;

async function usersByIds(ids: string[]) {
  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: { id: true, username: true, name: true },
  });
  return new Map(users.map((u) => [u.id, u]));
}

type LineLike = { price: number; quantity: number; eventId: string | null };

function computeTotals(lines: LineLike[]) {
  let total = 0;
  let commission = 0;
  for (const l of lines) {
    const lineTotal = l.price * l.quantity;
    total += lineTotal;
    commission += lineTotal * (l.eventId ? COMMISSION_EVENT : COMMISSION_THIRD);
  }
  total = Number(total.toFixed(2));
  commission = Number(commission.toFixed(2));
  return { total, commission, sellerPayout: Number((total - commission).toFixed(2)) };
}

// ==================== PRODUTOS ====================

export async function createProduct(userId: string, input: CreateProductInput) {
  return prisma.product.create({
    data: {
      sellerId: userId,
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      category: input.category,
      images: input.images ?? [],
      eventId: input.eventId,
    },
  });
}

export async function listProducts(filters: {
  category?: CreateProductInput['category'];
  q?: string;
  eventId?: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.eventId ? { eventId: filters.eventId } : {}),
      ...(filters.q
        ? { name: { contains: filters.q, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  const sellers = await usersByIds(products.map((p) => p.sellerId));
  return products.map((p) => ({ ...p, seller: sellers.get(p.sellerId) ?? null }));
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Produto não encontrado');
  const sellers = await usersByIds([product.sellerId]);
  return { ...product, seller: sellers.get(product.sellerId) ?? null };
}

// ==================== PEDIDOS / ESCROW ====================

export async function createOrder(userId: string, input: CreateOrderInput) {
  const ids = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const p = byId.get(item.productId);
    if (!p || !p.isActive) throw new AppError(404, 'Produto indisponível');
    if (p.stock < item.quantity) {
      throw new AppError(409, `Estoque insuficiente: ${p.name}`);
    }
  }

  const sellerIds = new Set(products.map((p) => p.sellerId));
  if (sellerIds.size > 1) {
    throw new AppError(400, 'Um pedido deve conter itens de um único vendedor');
  }
  const sellerId = products[0].sellerId;

  const lines = input.items.map((i) => {
    const p = byId.get(i.productId)!;
    return { price: p.price, quantity: i.quantity, eventId: p.eventId };
  });
  const totals = computeTotals(lines);
  const paymentId = randomUUID();

  const order = await prisma.order.create({
    data: {
      buyerId: userId,
      total: totals.total,
      status: 'PENDING',
      paymentId,
      items: {
        create: input.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: byId.get(i.productId)!.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return {
    order,
    payment: { paymentId, amount: totals.total, method: 'SANDBOX', status: 'PENDING' },
    commission: totals.commission,
    sellerPayout: totals.sellerPayout,
    sellerId,
  };
}

export async function payOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError(404, 'Pedido não encontrado');
  if (order.buyerId !== userId) throw new AppError(403, 'Pedido de outro usuário');
  if (order.status !== 'PENDING') {
    throw new AppError(409, 'Pedido não está aguardando pagamento');
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        throw new AppError(404, 'Produto indisponível');
      }
      if (product.stock < item.quantity) {
        throw new AppError(409, `Estoque insuficiente: ${product.name}`);
      }
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }
    await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
  });

  await notifySafe(order.items[0].product.sellerId, {
    type: 'ORDER',
    title: '💰 Pedido pago',
    body: `Um pedido de R$ ${order.total.toFixed(2)} está em escrow.`,
    data: { orderId },
  });

  return {
    orderId,
    status: 'PAID',
    escrow: 'Pagamento retido até a confirmação de entrega ou liberação em 48h.',
  };
}

/**
 * Liquida um pedido em escrow: PAID → DELIVERED e credita o repasse
 * líquido na carteira do vendedor (ledger real). Idempotente — só age
 * em pedidos PAID. Usado por `confirmDelivery` e pelo job de auto-release.
 */
async function settleOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.status !== 'PAID') return null;

  await prisma.order.update({ where: { id: orderId }, data: { status: 'DELIVERED' } });

  const totals = computeTotals(
    order.items.map((i) => ({
      price: i.price,
      quantity: i.quantity,
      eventId: i.product.eventId,
    }))
  );

  await credit(
    order.items[0].product.sellerId,
    totals.sellerPayout,
    'SALE',
    `Venda do pedido #${orderId.slice(0, 8)}`,
    { refType: 'order', refId: orderId }
  );

  return totals;
}

export async function confirmDelivery(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, status: true },
  });
  if (!order) throw new AppError(404, 'Pedido não encontrado');
  if (order.buyerId !== userId) throw new AppError(403, 'Apenas o comprador confirma');
  if (order.status !== 'PAID') {
    throw new AppError(409, 'Só pedidos pagos (em escrow) podem ser confirmados');
  }

  const totals = await settleOrder(orderId);
  return {
    orderId,
    status: 'DELIVERED',
    released: true,
    ...(totals ?? { total: 0, commission: 0, sellerPayout: 0 }),
  };
}

export async function openDispute(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { sellerId: true } } } } },
  });
  if (!order) throw new AppError(404, 'Pedido não encontrado');
  if (order.buyerId !== userId) throw new AppError(403, 'Apenas o comprador disputa');
  if (order.status !== 'PAID') {
    throw new AppError(409, 'Só é possível disputar um pedido em escrow');
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: 'DISPUTED' } });

  await notifySafe(order.items[0].product.sellerId, {
    type: 'ORDER',
    title: '⚠️ Pedido em disputa',
    body: 'O comprador abriu uma disputa. Aguarde a revisão.',
    data: { orderId },
  });

  return { orderId, status: 'DISPUTED', note: 'Pedido enviado para revisão manual.' };
}

/**
 * Libera automaticamente pedidos pagos há mais de 48h sem disputa.
 * Executado pelo job `escrowAutoRelease` (antes era varredura oportunista
 * nas listagens). Retorna a quantidade liberada.
 */
export async function releaseExpiredEscrow(): Promise<number> {
  const cutoff = new Date(Date.now() - AUTO_RELEASE_MS);
  const eligible = await prisma.order.findMany({
    where: { status: 'PAID', createdAt: { lt: cutoff } },
    select: { id: true },
  });
  let settled = 0;
  for (const o of eligible) {
    if (await settleOrder(o.id)) settled += 1;
  }
  return settled;
}

function decorate(
  order: {
    items: Array<{ price: number; quantity: number; product: { eventId: string | null } }>;
  } & Record<string, unknown>
) {
  const totals = computeTotals(
    order.items.map((i) => ({
      price: i.price,
      quantity: i.quantity,
      eventId: i.product.eventId,
    }))
  );
  return { ...order, ...totals };
}

export async function listMyOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  });
  const sellers = await usersByIds(
    orders.flatMap((o) => o.items.map((i) => i.product.sellerId))
  );
  return orders.map((o) => ({
    ...decorate(o),
    seller: sellers.get(o.items[0]?.product.sellerId ?? '') ?? null,
  }));
}

export async function listMySales(userId: string) {
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: userId } } } },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  });
  const buyers = await usersByIds(orders.map((o) => o.buyerId));
  return orders.map((o) => ({
    ...decorate(o),
    buyer: buyers.get(o.buyerId) ?? null,
  }));
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError(404, 'Pedido não encontrado');

  const isBuyer = order.buyerId === userId;
  const isSeller = order.items.some((i) => i.product.sellerId === userId);
  if (!isBuyer && !isSeller) {
    throw new AppError(403, 'Você não participa deste pedido');
  }
  return { ...decorate(order), role: isBuyer ? 'BUYER' : 'SELLER' };
}
