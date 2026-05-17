import { Router } from 'express';
import * as search from '../controllers/search.controller';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/', asyncHandler(search.search));

export default router;
