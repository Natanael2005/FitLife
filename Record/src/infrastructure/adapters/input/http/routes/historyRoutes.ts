import { Router } from 'express';
import { WorkoutHistoryController } from '../controllers/WorkoutHistoryController';

export function createHistoryRoutes(controller: WorkoutHistoryController): Router {
  const router = Router();

  router.get('/user/:userId', controller.getHistory.bind(controller));
  router.post('/user/:userId', controller.addWorkout.bind(controller));
  router.get('/user/:userId/total', controller.getTotalWorkouts.bind(controller));
  router.delete('/:id', controller.deleteWorkout.bind(controller));

  return router;
}

