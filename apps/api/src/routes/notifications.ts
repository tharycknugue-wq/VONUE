import { Router } from 'express';
import * as notifications from '../controllers/notifications.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/', auth, asyncHandler(notifications.list));
router.post('/token', auth, asyncHandler(notifications.registerToken));
router.post('/read-all', auth, asyncHandler(notifications.markAllRead));
router.post('/:id/read', auth, asyncHandler(notifications.markRead));

export default router;
