import { UserStatsService } from "../../../../../application/services/UserStatsService";
import { Request, Response } from "express";
import { StatsNotFound } from "../../../../../domain/exceptions/StatsNotFound";

export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const stats = await this.userStatsService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      if (error instanceof StatsNotFound) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const statsUpdate = req.body;
      const updatedStats = await this.userStatsService.updateUserStats(userId, statsUpdate);
      res.json(updatedStats);
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      res.status(400).json({ error: errorMessage });
    }
  }

  async createUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const statsData = req.body;
      const newStats = await this.userStatsService.createUserStats(userId, statsData);
      res.status(201).json(newStats);
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      res.status(400).json({ error: errorMessage });
    }
  }
}
