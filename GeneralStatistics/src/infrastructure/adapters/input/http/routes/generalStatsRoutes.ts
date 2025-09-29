import { Router } from 'express';
import { GeneralStatsController } from '../controllers/GeneralStatsController';

export function createGeneralStatsRoutes(generalStatsController: GeneralStatsController): Router {
  const router = Router();

  router.get('/system', generalStatsController.getSystemStats.bind(generalStatsController));
  router.get('/insights', generalStatsController.getInsights.bind(generalStatsController));
  router.get('/popular-routines', generalStatsController.getPopularRoutines.bind(generalStatsController));
  router.get('/demographics', generalStatsController.getDemographics.bind(generalStatsController));

  return router;
}
