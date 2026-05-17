import { Router } from 'express';
import * as paymentsController from '../controllers/payments.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

// Webhook do Stripe (sem auth — chamado pelo provedor, assinatura no body).
router.post('/webhook', asyncHandler(paymentsController.webhook));
// Sandbox: confirmação manual (recusada se o pagamento for via Stripe).
router.post('/confirm', auth, asyncHandler(paymentsController.confirm));
router.get('/:id', auth, asyncHandler(paymentsController.status));

export default router;
