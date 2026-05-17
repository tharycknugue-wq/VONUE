import type { Request, Response } from 'express';
import * as eventService from '../services/event.service';
import * as ticketService from '../services/ticket.service';
import * as reviewService from '../services/review.service';
import {
  createEventSchema,
  listEventsQuerySchema,
  checkinSchema,
} from '../schemas/event.schema';
import { createTicketTypesSchema } from '../schemas/ticket.schema';
import { createReviewSchema } from '../schemas/review.schema';
import { AppError } from '../middlewares/error';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Não autenticado');
  return req.user;
}

export async function list(req: Request, res: Response): Promise<void> {
  const filters = listEventsQuerySchema.parse(req.query);
  res.json({ events: await eventService.listEvents(filters) });
}

export async function detail(req: Request, res: Response): Promise<void> {
  res.json(await eventService.getEvent(req.params.id));
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createEventSchema.parse(req.body);
  res.status(201).json(await eventService.createEvent(user.id, input));
}

export async function createTicketTypes(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { ticketTypes } = createTicketTypesSchema.parse(req.body);
  res
    .status(201)
    .json(await ticketService.createTicketTypes(user.id, req.params.id, ticketTypes));
}

export async function checkins(req: Request, res: Response): Promise<void> {
  res.json(await eventService.listCheckins(req.params.id));
}

export async function checkin(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const coords = checkinSchema.parse(req.body ?? {});
  res.status(201).json(await eventService.checkin(user.id, req.params.id, coords));
}

export async function reviewOrganizer(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = createReviewSchema.parse(req.body);
  res
    .status(201)
    .json(await reviewService.reviewOrganizer(user.id, req.params.id, input));
}

export async function listReviews(req: Request, res: Response): Promise<void> {
  res.json(await reviewService.eventOrganizerReviews(req.params.id));
}
