import { Request, Response } from 'express';
import { ExerciseService } from '../../../../../application/services/ExerciseService';

export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  async getExercises(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        categoria: req.query.categoria as string,
        nivel: req.query.nivel as string,
        musculo_principal: req.query.musculo_principal as string,
        search: req.query.search as string
      };

      const exercises = await this.exerciseService.getExercises(filters);
      res.json(exercises);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getExerciseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const exercise = await this.exerciseService.getExerciseById(id);
      res.json(exercise);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createExercise(req: Request, res: Response): Promise<void> {
    try {
      const exercise = await this.exerciseService.createExercise(req.body);
      res.status(201).json(exercise);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateExercise(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const exercise = await this.exerciseService.updateExercise(id, req.body);
      res.json(exercise);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteExercise(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.exerciseService.deleteExercise(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
