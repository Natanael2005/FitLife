// src/infrastructure/config/express.ts

import express from 'express';
import { requestIdMiddleware } from '../adapters/input/http/middlewares/requestId.js';
import { errorHandlerMiddleware } from '../adapters/input/http/middlewares/errorHandler.js';
import { createOrchestratorRouter } from '../adapters/input/http/routes.js';
import { IOrchestratorService } from '../../application/ports/input/orchestrator.service.js';

export function createExpressApp(orchestratorService: IOrchestratorService) {
  const app = express();
  
  // Middleware para parsear el body de las peticiones a JSON
  app.use(express.json());

  // Middleware para añadir el ID de correlación
  app.use(requestIdMiddleware);
  
  // Registramos nuestro enrutador principal
  app.use('/', createOrchestratorRouter(orchestratorService));

  // El middleware de manejo de errores DEBE ser el último en registrarse
  app.use(errorHandlerMiddleware);

  return app;
}