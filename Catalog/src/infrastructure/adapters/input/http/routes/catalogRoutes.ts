import { Router } from 'express';
import { ExerciseController } from '../controllers/ExerciseController';
import { FoodController } from '../controllers/FoodController';

export function createCatalogRoutes(
  exerciseController: ExerciseController,
  foodController: FoodController
): Router {
  const router = Router();

  // Exercise routes
  router.get('/exercises', exerciseController.getExercises.bind(exerciseController));
  router.get('/exercises/:id', exerciseController.getExerciseById.bind(exerciseController));
  router.post('/exercises', exerciseController.createExercise.bind(exerciseController));
  router.put('/exercises/:id', exerciseController.updateExercise.bind(exerciseController));
  router.delete('/exercises/:id', exerciseController.deleteExercise.bind(exerciseController));

  // Food routes
  router.get('/foods', foodController.getFoods.bind(foodController));
  router.get('/foods/:id', foodController.getFoodById.bind(foodController));
  router.post('/foods', foodController.createFood.bind(foodController));
  router.put('/foods/:id', foodController.updateFood.bind(foodController));
  router.delete('/foods/:id', foodController.deleteFood.bind(foodController));

  return router;
}
