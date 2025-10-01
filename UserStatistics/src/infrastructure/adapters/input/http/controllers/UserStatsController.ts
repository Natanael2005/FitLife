import { UserStatsService } from "../../../../../application/services/UserStatsService";
import { Request, Response } from "express";

export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const stats = await this.userStatsService.getUserStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { weight, height } = req.body;
      
      const updatedStats = await this.userStatsService.updateUserStats(
        userId, 
        weight, 
        height
      );
      
      res.json(updatedStats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { weight, height } = req.body;
      
      if (!weight || !height) {
        res.status(400).json({ error: 'Weight and height are required' });
        return;
      }

      const newStats = await this.userStatsService.createUserStats(
        userId,
        weight,
        height
      );
      
      res.status(201).json(newStats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
