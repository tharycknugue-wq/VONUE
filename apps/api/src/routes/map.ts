import { Router } from 'express';
import * as mapController from '../controllers/map.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/event/:id', auth, asyncHandler(mapController.eventSnapshot));

export default router;
