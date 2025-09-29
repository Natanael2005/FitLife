import { Request, Response } from 'express';
import { SaveActivityUseCase } from '../../../../../application/ports/input/SaveActivityUseCase';
import { GetHistoryUseCase } from '../../../../../application/ports/input/GetHistoryUseCase';
import { ActivityType } from '../../../../../domain/value-objects/ActivityType';

export class HistoryController {
  constructor(
    private readonly saveActivityUseCase: SaveActivityUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase
  ) {}

  async saveActivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, name, duration, caloriesBurned, metadata } = req.body;
      
      const activity = {
        userId,
        type: type as ActivityType,
        name,
        duration,
        caloriesBurned,
        date: new Date(),
        metadata: metadata || {},
        isWorkout: () => type === 'workout',
        isNutrition: () => type === 'nutrition'
      };

      const savedActivity = await this.saveActivityUseCase.execute(activity);
      res.status(201).json(savedActivity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate, activityType, limit = 50, offset = 0 } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        activityType: activityType as ActivityType,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const history = await this.getHistoryUseCase.getHistory(userId, filters);
      res.json(history);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { period = 'month' } = req.query;
      
      res.json({ message: 'Summary endpoint - to be implemented', userId, period });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }
}
