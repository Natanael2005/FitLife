// src/infrastructure/adapters/input/http/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  CaretakerServiceError,
  RoutinesServiceError,
  UpstreamTimeoutError,
  InvalidPayloadError,
  PropagatedError,
} from '../../../../../domain/entities/errors.js';

export const errorHandlerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const requestId = req.requestId || 'unknown';
  console.error(`[${new Date().toISOString()}] [${requestId}] Error: ${err.name} - ${err.message}`);

  if (err instanceof InvalidPayloadError || err instanceof ZodError) {
    const details = err instanceof ZodError ? err.issues.map(e => `${e.path.join('.')}: ${e.message}`) : err.details;
    return res.status(400).json({ error: 'invalid_payload', details });
  }

  if (err instanceof PropagatedError) {
    return res.status(err.statusCode).json(err.body);
  }
  
  if (err instanceof CaretakerServiceError) {
    return res.status(502).json({ error: 'caretaker_unavailable' });
  }

  if (err instanceof RoutinesServiceError) {
    return res.status(502).json({ error: 'routines_unavailable' });
  }
  
  if (err instanceof UpstreamTimeoutError) {
    return res.status(504).json({ error: 'upstream_timeout', upstream: err.upstream });
  }

  // Error genérico para no filtrar detalles de implementación
  res.status(500).json({ error: 'internal_server_error' });
};