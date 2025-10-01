import { Request, Response } from 'express';
import { WorkoutHistoryService } from '../../../../../application/services/WorkoutHistoryService';

export class WorkoutHistoryController {
  constructor(private readonly historyService: WorkoutHistoryService) {}

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await this.historyService.getHistory(userId, limit, offset);
      res.json(history);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async addWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { routineName, routineId, completedAt } = req.body;

      if (!routineName || !routineId) {
        res.status(400).json({ 
          error: 'routineName and routineId are required' 
        });
        return;
      }

      const newWorkout = await this.historyService.addWorkout(
        userId,
        routineName,
        routineId,
        completedAt ? new Date(completedAt) : undefined
      );

      res.status(201).json(newWorkout);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTotalWorkouts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const total = await this.historyService.getTotalWorkouts(userId);
      res.json({ userId, totalWorkouts: total });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async deleteWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.historyService.deleteWorkout(parseInt(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
