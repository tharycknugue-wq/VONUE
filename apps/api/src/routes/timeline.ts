import { Router } from 'express';
import * as timeline from '../controllers/timeline.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/', auth, asyncHandler(timeline.get));

export default router;
