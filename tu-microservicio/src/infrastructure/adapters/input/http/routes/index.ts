import { Express, Router } from 'express';
import authRouter from './auth.routes';

export function registerRoutes(app: Express) {
  const api = Router();
  api.use('/auth', authRouter); // /api/auth/*
  app.use('/api', api);
}