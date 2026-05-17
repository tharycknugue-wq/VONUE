import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/questions', asyncHandler(onboardingController.getQuestions));
router.post('/complete', auth, asyncHandler(onboardingController.complete));

export default router;
