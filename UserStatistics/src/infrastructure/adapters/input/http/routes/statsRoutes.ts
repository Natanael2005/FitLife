import { Router } from 'express';
import { UserStatsController } from '../controllers/UserStatsController';

export function createStatsRoutes(userStatsController: UserStatsController): Router {
  const router = Router();

  router.get('/user/:userId', userStatsController.getUserStats.bind(userStatsController));
  router.post('/user/:userId', userStatsController.createUserStats.bind(userStatsController));
  router.post('/user/:userId/update', userStatsController.updateUserStats.bind(userStatsController));
  router.put('/user/:userId', userStatsController.updateUserStats.bind(userStatsController));

  return router;
}

