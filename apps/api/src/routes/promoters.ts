import { Router } from 'express';
import * as promoter from '../controllers/promoter.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/me', auth, asyncHandler(promoter.me));
router.get('/:id/reviews', asyncHandler(promoter.reviews));
router.post('/:id/review', auth, asyncHandler(promoter.review));

export default router;
