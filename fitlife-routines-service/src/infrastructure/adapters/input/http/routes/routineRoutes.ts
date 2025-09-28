import { Router } from 'express';
import { RoutineController } from '../controllers/RoutineController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const buildRoutineRouter = (controller: RoutineController): Router => {
  const router = Router();

  router.post('/', asyncHandler(controller.create));
  router.get('/user/:userId', asyncHandler(controller.getByUser)); // ← antes que '/:id'
  router.get('/:id', asyncHandler(controller.getById));
  router.put('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.delete));

  return router;
};
