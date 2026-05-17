import { Router } from 'express';
import * as dj from '../controllers/dj.controller';
import * as tip from '../controllers/tip.controller';
import { auth, optionalAuth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.post('/', auth, asyncHandler(dj.become));
router.get('/me', auth, asyncHandler(dj.me));
router.get('/', optionalAuth, asyncHandler(dj.list));
router.get('/:id', optionalAuth, asyncHandler(dj.detail));
router.post('/:id/follow', auth, asyncHandler(dj.follow));
router.delete('/:id/follow', auth, asyncHandler(dj.unfollow));
router.post('/:id/tip', auth, asyncHandler(tip.create));
router.get('/:id/reviews', asyncHandler(dj.reviews));
router.post('/:id/review', auth, asyncHandler(dj.review));

export default router;
