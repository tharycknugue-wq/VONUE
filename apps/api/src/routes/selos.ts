import { Router } from 'express';
import * as selosController from '../controllers/selos.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/mine', auth, asyncHandler(selosController.mine));

export default router;
