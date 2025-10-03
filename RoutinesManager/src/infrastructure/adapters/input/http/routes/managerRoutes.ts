import { Router } from 'express';
import { RoutineManagerController } from '../controllers/RoutineManagerController';

export function createManagerRoutes(controller: RoutineManagerController): Router {
  const router = Router();

  router.post('/assign', controller.assignRoutine.bind(controller));
  router.get('/user/:userId', controller.getUserRoutines.bind(controller));
  router.get('/user/:userId/details', controller.getUserRoutinesWithDetails.bind(controller));
  router.delete('/user/:userId/routine/:routineId', controller.removeRoutine.bind(controller));

  return router;
}
