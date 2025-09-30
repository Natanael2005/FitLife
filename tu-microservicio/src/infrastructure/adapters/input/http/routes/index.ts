import { Express, Router } from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';

export function registerRoutes(app: Express) {
  const api = Router();
  api.use('/auth', authRouter); // /api/auth/*
  api.use('/health', healthRouter); // /api/health/*
  app.use('/api', api);
}