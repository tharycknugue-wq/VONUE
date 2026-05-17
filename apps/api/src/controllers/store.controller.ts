import type { Request, Response } from 'express';
import * as storeService from '../services/store.service';
import {
  createProductSchema,
  listProductsQuerySchema,
  createOrderSchema,
} from '../schemas/store.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createProductSchema.parse(req.body);
  res.status(201).json(await storeService.createProduct(user.id, input));
}

export async function listProducts(req: Request, res: Response): Promise<void> {
  const filters = listProductsQuerySchema.parse(req.query);
  res.json({ products: await storeService.listProducts(filters) });
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  res.json(await storeService.getProduct(req.params.id));
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createOrderSchema.parse(req.body);
  res.status(201).json(await storeService.createOrder(user.id, input));
}

export async function myOrders(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json({ orders: await storeService.listMyOrders(user.id) });
}

export async function mySales(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json({ orders: await storeService.listMySales(user.id) });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await storeService.getOrder(user.id, req.params.id));
}

export async function payOrder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await storeService.payOrder(user.id, req.params.id));
}

export async function confirmOrder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await storeService.confirmDelivery(user.id, req.params.id));
}

export async function disputeOrder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await storeService.openDispute(user.id, req.params.id));
}
