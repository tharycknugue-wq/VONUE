import { Router } from 'express';
import * as job from '../controllers/job.controller';
import { auth, optionalAuth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/open', asyncHandler(job.listOpen));
router.post('/applications/:id/accept', auth, asyncHandler(job.accept));
router.get('/:id/reviews', asyncHandler(job.reviews));
router.get('/:id', optionalAuth, asyncHandler(job.detail));
router.post('/:id/apply', auth, asyncHandler(job.apply));
router.post('/:id/review', auth, asyncHandler(job.review));

export default router;
