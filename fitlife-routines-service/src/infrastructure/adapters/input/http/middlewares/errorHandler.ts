import type { Request, Response, NextFunction } from 'express';
import { RoutineNotFound } from '../../../../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../../../../domain/exceptions/UnauthorizedAccess.js';
import { InvalidRoutineData } from '../../../../../domain/exceptions/InvalidRoutineData.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof RoutineNotFound) return res.status(404).json({ error: err.message });
  if (err instanceof UnauthorizedAccess) return res.status(403).json({ error: err.message });
  if (err instanceof InvalidRoutineData) return res.status(422).json({ error: err.message });
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
