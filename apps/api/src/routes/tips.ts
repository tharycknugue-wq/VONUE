import { Router } from 'express';
import * as tip from '../controllers/tip.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/mine', auth, asyncHandler(tip.mine));
router.post('/:id/pay', auth, asyncHandler(tip.pay));

export default router;
