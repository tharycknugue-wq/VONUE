import { Router } from 'express';
import * as photos from '../controllers/photos.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/tagged', auth, asyncHandler(photos.tagged));
router.post('/tags/:id/approve', auth, asyncHandler(photos.approveTag));
router.post('/tags/:id/reject', auth, asyncHandler(photos.rejectTag));
router.get('/:id/reviews', asyncHandler(photos.photographerReviews));
router.post('/:id/review', auth, asyncHandler(photos.reviewPhotographer));

export default router;
