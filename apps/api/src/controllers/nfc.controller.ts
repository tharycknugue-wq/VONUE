import type { Request, Response } from 'express';
import * as nfcService from '../services/nfc.service';
import { nfcConnectSchema } from '../schemas/nfc.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function createToken(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.status(201).json(await nfcService.createTapToken(user.id));
}

export async function connect(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { token } = nfcConnectSchema.parse(req.body);
  res.status(201).json(await nfcService.connect(user.id, token));
}

export async function accept(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await nfcService.accept(user.id, req.params.id));
}

export async function reject(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await nfcService.reject(user.id, req.params.id));
}

export async function list(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const connections = await nfcService.listConnections(user.id);
  res.json({ total: connections.length, connections });
}
