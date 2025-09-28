import type { ErrorRequestHandler } from 'express';
import { HttpStatus } from '../../../../../shared/constants/HttpStatus.js';
import { RoutineNotFound } from '../../../../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../../../../domain/exceptions/UnauthorizedAccess.js';
import { InvalidRoutineData } from '../../../../../domain/exceptions/InvalidRoutineData.js';
import { Logger } from '../../../../../shared/utils/Logger.js';

const log = new Logger('ErrorHandler');

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof RoutineNotFound) {
    return res.status(HttpStatus.NOT_FOUND).json({ error: err.name, message: err.message });
  }
  if (err instanceof UnauthorizedAccess) {
    return res.status(HttpStatus.FORBIDDEN).json({ error: err.name, message: err.message });
  }
  if (err instanceof InvalidRoutineData) {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: err.name, message: err.message });
  }

  if (err instanceof Error) {
    log.error(err.message, { stack: err.stack });
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'InternalError', message: err.message });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'UnknownError' });
};
