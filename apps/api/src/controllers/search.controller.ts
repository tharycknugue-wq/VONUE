import type { Request, Response } from 'express';
import * as searchService from '../services/search.service';

export async function search(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  res.json(await searchService.search(q));
}
