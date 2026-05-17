import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.post('/purchase', auth, asyncHandler(ticketsController.purchase));
router.get('/mine', auth, asyncHandler(ticketsController.mine));
router.post('/checkin', auth, asyncHandler(ticketsController.checkin));

export default router;
