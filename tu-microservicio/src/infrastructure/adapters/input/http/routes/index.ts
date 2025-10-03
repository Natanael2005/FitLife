import { Express, Router } from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';
import cuidadorRouter from './cuidador.routes';
import catalogoDemoRouter from './catalogo-demo.routes';

export function registerRoutes(app: Express) {
  const api = Router();
  api.use('/auth', authRouter); // /api/auth/*
  api.use('/health', healthRouter); // /api/health/*
  api.use('/cuidador', cuidadorRouter); // /api/cuidador/*
  api.use('/catalogo-demo', catalogoDemoRouter); // /api/catalogo-demo/*
  app.use('/api', api);
}