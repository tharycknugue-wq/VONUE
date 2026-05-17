import { Router } from 'express';
import * as nfcController from '../controllers/nfc.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.post('/token', auth, asyncHandler(nfcController.createToken));
router.post('/connect', auth, asyncHandler(nfcController.connect));
router.get('/connections', auth, asyncHandler(nfcController.list));
router.post('/accept/:id', auth, asyncHandler(nfcController.accept));
router.delete('/reject/:id', auth, asyncHandler(nfcController.reject));

export default router;
