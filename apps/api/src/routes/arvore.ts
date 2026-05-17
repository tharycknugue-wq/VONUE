import { Router } from 'express';
import * as arvoreController from '../controllers/arvore.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.post('/confirm-superior', auth, asyncHandler(arvoreController.confirmSuperior));

export default router;
