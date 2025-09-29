import { Router } from 'express';
import { HistoryController } from '../controllers/HistoryController';

export function createHistoryRoutes(historyController: HistoryController): Router {
  const router = Router();

  router.post('/activity', historyController.saveActivity.bind(historyController));
  router.get('/user/:userId', historyController.getHistory.bind(historyController));
  router.get('/user/:userId/summary', historyController.getSummary.bind(historyController));

  return router;
}
