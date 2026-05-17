import { randomUUID } from 'crypto';
import type { Ticket } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import * as payment from './payment.service';
import { checkin as eventCheckin } from './event.service';
import { credit } from './wallet.service';

// Comissão Vonue sobre venda de ingresso: 8%.
const TICKET_COMMISSION = 0.08;

async function assertOrganizer(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: { select: { userId: true } } },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');
  if (event.organizer.userId !== userId) {
    throw new AppError(403, 'Apenas o organizador do evento pode criar lotes');
  }
  return event;
}

export async function createTicketTypes(
  userId: string,
  eventId: string,
  list: Array<{ name: string; price: number; quantity: number }>
) {
  await assertOrganizer(userId, eventId);
  return prisma.$transaction(
    list.map((t) =>
      prisma.ticketType.create({
        data: { eventId, name: t.name, price: t.price, quantity: t.quantity },
      })
    )
  );
}

export async function purchase(
  userId: string,
  input: {
    ticketTypeId: string;
    quantity: number;
    method: payment.PaymentMethod;
    promoterCode?: string;
  }
) {
  const tt = await prisma.ticketType.findUnique({
    where: { id: input.ticketTypeId },
    include: { event: { select: { id: true, name: true, isPublished: true } } },
  });

  if (!tt || !tt.isActive || !tt.event.isPublished) {
    throw new AppError(404, 'Ingresso indisponível');
  }
  if (tt.sold + input.quantity > tt.quantity) {
    throw new AppError(409, 'Lote esgotado para essa quantidade');
  }

  let promoterId: string | undefined;
  if (input.promoterCode) {
    const ep = await prisma.eventPromoter.findUnique({
      where: {
        eventId_promoterId: {
          eventId: tt.event.id,
          promoterId: input.promoterCode,
        },
      },
      select: { promoterId: true },
    });
    if (!ep) {
      throw new AppError(400, 'Código de promoter inválido para este evento');
    }
    promoterId = ep.promoterId;
  }

  const amount = Number((tt.price * input.quantity).toFixed(2));
  const paymentId = randomUUID();
  const rec = await payment.createPending({
    paymentId,
    userId,
    ticketTypeId: tt.id,
    quantity: input.quantity,
    amount,
    method: input.method,
    promoterId,
  });

  return {
    paymentId,
    status: rec.status,
    method: rec.method,
    amount,
    provider: rec.provider,
    clientSecret: rec.clientSecret ?? null,
    event: { id: tt.event.id, name: tt.event.name },
    ticketType: { id: tt.id, name: tt.name },
    pix:
      rec.provider === 'SANDBOX' && input.method === 'PIX'
        ? payment.pixPayload(rec)
        : null,
  };
}

/**
 * Núcleo idempotente: emite ingressos + repasses. Chamado pelo webhook
 * do Stripe (assinado) e, no sandbox, por confirmSandbox. Sem checagem
 * de dono — quem chama é responsável por autorizar.
 */
export async function finalizePayment(paymentId: string) {
  const pay = await payment.getPayment(paymentId);
  if (pay.status === 'CANCELLED') {
    throw new AppError(409, 'Pagamento cancelado');
  }
  if (pay.status === 'PAID') {
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: pay.ticketIds ?? [] } },
    });
    return { status: pay.status, alreadyConfirmed: true, tickets };
  }

  const tickets = await prisma.$transaction(async (tx) => {
    const tt = await tx.ticketType.findUnique({ where: { id: pay.ticketTypeId } });
    if (!tt || !tt.isActive) throw new AppError(404, 'Ingresso indisponível');
    if (tt.sold + pay.quantity > tt.quantity) {
      throw new AppError(409, 'Lote esgotado');
    }
    await tx.ticketType.update({
      where: { id: tt.id },
      data: { sold: { increment: pay.quantity } },
    });
    const created: Ticket[] = [];
    for (let i = 0; i < pay.quantity; i++) {
      created.push(
        await tx.ticket.create({
          data: {
            userId: pay.userId,
            ticketTypeId: tt.id,
            status: 'ACTIVE',
            paymentId,
            promoterId: pay.promoterId ?? null,
          },
        })
      );
    }
    return created;
  });

  pay.status = 'PAID';
  pay.ticketIds = tickets.map((t) => t.id);
  await payment.savePayment(pay);

  // Repasse: total − 8% Vonue − comissão do promoter (se houver).
  const tt = await prisma.ticketType.findUnique({
    where: { id: pay.ticketTypeId },
    select: {
      event: {
        select: { id: true, name: true, organizer: { select: { userId: true } } },
      },
    },
  });
  if (tt) {
    let promoterCut = 0;
    if (pay.promoterId) {
      const ep = await prisma.eventPromoter.findUnique({
        where: {
          eventId_promoterId: { eventId: tt.event.id, promoterId: pay.promoterId },
        },
        include: { promoter: { select: { userId: true } } },
      });
      if (ep) {
        promoterCut = Number((pay.amount * ep.commission).toFixed(2));
        await prisma.promoter.update({
          where: { id: pay.promoterId },
          data: { totalSales: { increment: pay.quantity } },
        });
        await credit(
          ep.promoter.userId,
          promoterCut,
          'TICKET',
          `Comissão de promoter: ${tt.event.name}`,
          { refType: 'payment', refId: paymentId }
        );
      }
    }
    const organizerNet = Number(
      (pay.amount * (1 - TICKET_COMMISSION) - promoterCut).toFixed(2)
    );
    await credit(
      tt.event.organizer.userId,
      organizerNet,
      'TICKET',
      `Ingressos: ${tt.event.name}`,
      { refType: 'payment', refId: paymentId }
    );
  }

  return { status: pay.status, alreadyConfirmed: false, tickets };
}

/**
 * Confirmação sandbox (sem PSP). Verifica o dono e recusa se o
 * pagamento é processado pelo Stripe (lá quem confirma é o webhook).
 */
export async function confirmSandbox(requesterId: string, paymentId: string) {
  const pay = await payment.getPayment(paymentId);
  if (pay.userId !== requesterId) {
    throw new AppError(403, 'Pagamento de outro usuário');
  }
  if (pay.provider === 'STRIPE') {
    throw new AppError(
      409,
      'Pagamento processado pelo provedor — aguarde a confirmação automática'
    );
  }
  return finalizePayment(paymentId);
}

export function listMyTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { purchasedAt: 'desc' },
    select: {
      id: true,
      qrCode: true,
      status: true,
      purchasedAt: true,
      checkedInAt: true,
      ticketType: {
        select: {
          name: true,
          price: true,
          event: {
            select: {
              id: true,
              name: true,
              date: true,
              venue: { select: { name: true, city: true, state: true } },
            },
          },
        },
      },
      promoter: { select: { id: true, user: { select: { name: true } } } },
    },
  });
}

/**
 * Validação do QR na portaria. Marca o ingresso como USED e dispara o
 * check-in do evento (selo de presença + gatilho da árvore + mapa ao vivo).
 */
export async function checkinByQr(requesterId: string, qrCode: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: { ticketType: { select: { eventId: true } } },
  });
  if (!ticket) throw new AppError(404, 'Ingresso inválido');
  if (ticket.userId !== requesterId) {
    throw new AppError(403, 'Este ingresso não é seu');
  }
  if (ticket.status === 'CANCELLED' || ticket.status === 'REFUNDED') {
    throw new AppError(409, 'Ingresso cancelado/estornado');
  }

  const alreadyUsed = ticket.status === 'USED';
  if (!alreadyUsed) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED', checkedInAt: new Date() },
    });
  }

  const event = await eventCheckin(ticket.userId, ticket.ticketType.eventId);
  return { alreadyUsed, ticketId: ticket.id, ...event };
}
