import { Router } from 'express';
import * as wallet from '../controllers/wallet.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/', auth, asyncHandler(wallet.get));
router.post('/withdraw', auth, asyncHandler(wallet.withdraw));

export default router;
