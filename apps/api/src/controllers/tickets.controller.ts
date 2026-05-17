import type { Request, Response } from 'express';
import * as ticketService from '../services/ticket.service';
import { purchaseSchema, ticketCheckinSchema } from '../schemas/ticket.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function purchase(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = purchaseSchema.parse(req.body);
  res.status(201).json(await ticketService.purchase(user.id, input));
}

export async function mine(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const tickets = await ticketService.listMyTickets(user.id);
  res.json({ total: tickets.length, tickets });
}

export async function checkin(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { qrCode } = ticketCheckinSchema.parse(req.body);
  res.json(await ticketService.checkinByQr(user.id, qrCode));
}
