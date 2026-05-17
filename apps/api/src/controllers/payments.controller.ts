import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import * as ticketService from '../services/ticket.service';
import * as paymentService from '../services/payment.service';
import { confirmPaymentSchema } from '../schemas/ticket.schema';
import { AppError } from '../middlewares/error';
import { logger } from '../lib/logger';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

// Confirmação sandbox (sem PSP). Com Stripe ativo, quem confirma é o
// webhook — este endpoint recusa pagamentos do provedor.
export async function confirm(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { paymentId } = confirmPaymentSchema.parse(req.body);
  res.json(await ticketService.confirmSandbox(user.id, paymentId));
}

export async function status(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const pay = await paymentService.getPayment(req.params.id);
  if (pay.userId !== user.id) throw new AppError(403, 'Pagamento de outro usuário');
  res.json({
    paymentId: pay.paymentId,
    status: pay.status,
    method: pay.method,
    amount: pay.amount,
    provider: pay.provider,
  });
}

// Webhook do Stripe. Body cru + assinatura verificada (ver app.ts).
export async function webhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    throw new AppError(400, 'Assinatura ausente');
  }
  const event = paymentService.verifyStripeEvent(req.body as Buffer, signature);

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const paymentId =
      (intent.metadata?.paymentId as string | undefined) ??
      (await paymentService.getPaymentIdByProviderRef(intent.id));
    if (paymentId) {
      await ticketService.finalizePayment(paymentId);
      logger.info(`✓ Stripe confirmou pagamento ${paymentId}`);
    }
  }

  res.json({ received: true });
}
