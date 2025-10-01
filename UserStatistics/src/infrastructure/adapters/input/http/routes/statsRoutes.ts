import { Router } from 'express';
import { UserStatsController } from '../controllers/UserStatsController';

export function createStatsRoutes(controller: UserStatsController): Router {
  const router = Router();

  router.get('/user/:userId', controller.getUserStats.bind(controller));
  router.post('/user/:userId', controller.createUserStats.bind(controller));
  router.put('/user/:userId', controller.updateUserStats.bind(controller));

  return router;
}
