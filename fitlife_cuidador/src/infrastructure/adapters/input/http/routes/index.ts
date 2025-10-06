import { Express, Router } from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';
import cuidadorRouter from './cuidador.routes';

export function registerRoutes(app: Express) {
  const api = Router();
  api.use('/auth', authRouter); // /api/auth/*
  api.use('/health', healthRouter); // /api/health/*
  api.use('/cuidador', cuidadorRouter); // /api/cuidador/*
  app.use('/api', api);
}