import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/error';
import { authLimiter } from '../middlewares/rateLimit';

const router = Router();

router.use(authLimiter);
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/verify-cpf', asyncHandler(authController.verifyCpf));

export default router;
