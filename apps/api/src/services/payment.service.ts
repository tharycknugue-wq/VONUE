import { getRedis } from '../lib/redis';
import { AppError } from '../middlewares/error';
import { isStripeEnabled, stripe } from '../lib/stripe';
import { logger } from '../lib/logger';

// Pagamento de ingressos. Com STRIPE_SECRET_KEY → Stripe PaymentIntent
// real, confirmado pelo webhook assinado. Sem a chave → sandbox
// (confirmação manual por /payments/confirm). O registro pendente no
// Redis é a fonte de verdade que liga o provedor à intenção de compra.

export type PaymentMethod = 'PIX' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentProvider = 'STRIPE' | 'SANDBOX';

export interface PendingPayment {
  paymentId: string;
  userId: string;
  ticketTypeId: string;
  quantity: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerRef?: string; // ex.: id do PaymentIntent
  clientSecret?: string; // usado pelo cliente real p/ confirmar o cartão
  ticketIds?: string[];
  promoterId?: string;
  createdAt: number;
}

const TTL_SEC = 1800; // 30 min para concluir o pagamento
const key = (id: string) => `pay:${id}`;
const refKey = (providerRef: string) => `payintent:${providerRef}`;

async function redis() {
  try {
    return await getRedis();
  } catch {
    throw new AppError(503, 'Pagamento indisponível no momento (Redis).');
  }
}

export async function createPending(
  data: Omit<
    PendingPayment,
    'status' | 'createdAt' | 'provider' | 'providerRef' | 'clientSecret'
  >
): Promise<PendingPayment> {
  const rec: PendingPayment = {
    ...data,
    status: 'PENDING',
    provider: isStripeEnabled() ? 'STRIPE' : 'SANDBOX',
    createdAt: Date.now(),
  };

  if (rec.provider === 'STRIPE') {
    const intent = await stripe().paymentIntents.create({
      amount: Math.round(rec.amount * 100),
      currency: 'brl',
      metadata: { paymentId: rec.paymentId },
      automatic_payment_methods: { enabled: true },
    });
    rec.providerRef = intent.id;
    rec.clientSecret = intent.client_secret ?? undefined;
  }

  const client = await redis();
  await client.set(key(rec.paymentId), JSON.stringify(rec), { EX: TTL_SEC });
  if (rec.providerRef) {
    await client.set(refKey(rec.providerRef), rec.paymentId, { EX: TTL_SEC });
  }
  return rec;
}

export async function getPayment(paymentId: string): Promise<PendingPayment> {
  const client = await redis();
  const raw = await client.get(key(paymentId));
  if (!raw) throw new AppError(404, 'Pagamento não encontrado ou expirado');
  return JSON.parse(raw) as PendingPayment;
}

export async function getPaymentIdByProviderRef(
  providerRef: string
): Promise<string | null> {
  const client = await redis();
  return client.get(refKey(providerRef));
}

export async function savePayment(rec: PendingPayment): Promise<void> {
  const client = await redis();
  await client.set(key(rec.paymentId), JSON.stringify(rec), { EX: TTL_SEC });
}

export function pixPayload(rec: PendingPayment) {
  // "Copia e cola" fake — só no sandbox (Stripe trataria Pix de verdade).
  const code = `00020126VONUE${rec.paymentId.replace(/-/g, '')}5204000053039865406${rec.amount.toFixed(2)}6304`;
  return { code, qrString: code, expiresInSec: TTL_SEC };
}

/** Verifica e decodifica o evento de webhook do Stripe (assinatura). */
export function verifyStripeEvent(rawBody: Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new AppError(500, 'STRIPE_WEBHOOK_SECRET não configurado');
  }
  try {
    return stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    logger.warn(`Webhook Stripe inválido: ${e instanceof Error ? e.message : e}`);
    throw new AppError(400, 'Assinatura de webhook inválida');
  }
}
