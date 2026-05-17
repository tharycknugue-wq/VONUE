import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import * as arvoreController from '../controllers/arvore.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/me', auth, asyncHandler(usersController.me));
router.post('/me/invite', auth, asyncHandler(arvoreController.createInvite));
router.get('/me/arvore', auth, asyncHandler(arvoreController.getArvore));

export default router;
