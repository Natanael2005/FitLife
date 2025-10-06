import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Usa el header si viene, si no, genera uno nuevo
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Adjuntamos el ID al objeto request para usarlo en otros lugares (ej. logs)
  // @ts-ignore - Añadimos una propiedad personalizada
  req.requestId = requestId; 

  // Devolvemos el ID en la respuesta para facilitar el debugging en el frontend
  res.setHeader('X-Request-Id', requestId);

  next();
};