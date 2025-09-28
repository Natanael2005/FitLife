import express from 'express';
import { errorHandler } from '../adapters/input/http/middlewares/errorHandler.js';

export function createExpressApp() {
  const app = express();
  app.use(express.json());
  return app;
}

export function registerErrorHandler(app: ReturnType<typeof createExpressApp>) {
  app.use(errorHandler);
}
