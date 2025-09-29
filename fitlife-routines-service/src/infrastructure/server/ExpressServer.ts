import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { routineRoutes } from '../adapters/input/http/routes/routineRoutes.js';
import { RoutineController } from '../adapters/input/http/controllers/RoutineController.js';
import { RoutineService } from '../../application/services/RoutineService.js';
import { InMemoryRoutineRepository } from '../adapters/output/persistence/InMemoryRoutineRepository.js';
import { errorHandler } from '../adapters/input/http/middlewares/errorHandler.js';

export function buildServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  const repo = new InMemoryRoutineRepository(); // luego cambiamos a PostgresRoutineRepository
  const service = new RoutineService(repo);
  const controller = new RoutineController(service);

  app.use('/', routineRoutes(controller));
  app.use(errorHandler);

  return app;
}
