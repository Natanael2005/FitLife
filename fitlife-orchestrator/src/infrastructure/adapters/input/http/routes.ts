import { Router } from 'express';
import { OrchestratorController } from './orchestrator.controller.js';
import { IOrchestratorService } from '../../../../application/ports/input/orchestrator.service.js';

export function createOrchestratorRouter(service: IOrchestratorService): Router {
  const router = Router();
  const controller = new OrchestratorController(service);

  // --- CAMBIO AQUÍ: de .post() a .get() ---
  router.get('/creacion/opciones', controller.getCreationOptions);
  
  router.post('/rutinas', controller.createRoutine);
  router.post('/rutinas/desde-default/:defaultId', controller.cloneRoutine);

  // Proxys a Rutinas Privadas
  router.get('/rutinas', controller.listUserRoutines);
  router.get('/rutinas/:id', controller.getUserRoutine);

  // Proxys a Rutinas Públicas
  router.get('/rutinas-default', controller.listPublicRoutines);
  router.get('/rutinas-default/:id', controller.getPublicRoutine);
  
  return router;
}