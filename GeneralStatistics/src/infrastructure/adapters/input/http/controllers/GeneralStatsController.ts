import { Request, Response } from 'express';
import { GetSystemStatsUseCase } from '../../../../../application/ports/input/GetSystemStatsUseCase';
import { GenerateInsightsUseCase } from '../../../../../application/ports/input/GenerateInsightsUseCase';

export class GeneralStatsController {
  constructor(
    private readonly getSystemStatsUseCase: GetSystemStatsUseCase,
    private readonly generateInsightsUseCase: GenerateInsightsUseCase
  ) {}

  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getSystemStatsUseCase.execute();
      res.json(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month' } = req.query;
      const insights = await this.generateInsightsUseCase.generateInsights(period as 'week' | 'month' | 'quarter');
      res.json(insights);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getPopularRoutines(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getSystemStatsUseCase.execute();
      res.json(stats.popularRoutines);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getDemographics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getSystemStatsUseCase.execute();
      res.json(stats.userDemographics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}
