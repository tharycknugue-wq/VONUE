import Stripe from 'stripe';
import { env } from '../config/env';

// Stripe é opcional: só ativa com STRIPE_SECRET_KEY. Sem a chave, o
// fluxo de pagamento de ingressos cai no sandbox (ver payment.service).
let client: Stripe | null = null;

if (env.STRIPE_SECRET_KEY) {
  client = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
}

export function isStripeEnabled(): boolean {
  return client !== null;
}

/** Cliente Stripe — só chame após checar isStripeEnabled(). */
export function stripe(): Stripe {
  if (!client) throw new Error('Stripe não configurado');
  return client;
}
