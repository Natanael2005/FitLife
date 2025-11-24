import { Router } from 'express';
import { RoutineManagerController } from '../controllers/RoutineManagerController';

export function createManagerRoutes(controller: RoutineManagerController): Router {
  const router = Router();

  router.post('/assign', controller.assignRoutine.bind(controller));
  router.get('/user/:usuario_id', controller.getUserRoutines.bind(controller));
  router.get('/user/:usuario_id/details', controller.getUserRoutinesWithDetails.bind(controller));
  router.delete('/user/:usuario_id/routine/:rutina_id', controller.removeRoutine.bind(controller));

  return router;
}