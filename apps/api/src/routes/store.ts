import { Router } from 'express';
import * as store from '../controllers/store.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/products', asyncHandler(store.listProducts));
router.post('/products', auth, asyncHandler(store.createProduct));
router.get('/products/:id', asyncHandler(store.getProduct));

router.post('/orders', auth, asyncHandler(store.createOrder));
router.get('/orders', auth, asyncHandler(store.myOrders));
router.get('/orders/sales', auth, asyncHandler(store.mySales));
router.get('/orders/:id', auth, asyncHandler(store.getOrder));
router.post('/orders/:id/pay', auth, asyncHandler(store.payOrder));
router.post('/orders/:id/confirm', auth, asyncHandler(store.confirmOrder));
router.post('/orders/:id/dispute', auth, asyncHandler(store.disputeOrder));

export default router;
