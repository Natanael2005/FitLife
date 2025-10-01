import { UserStats } from "../../domain/entities/UserStats";
import { UserStatsRepository } from "../ports/output/UserStatsRepository";
export class UserStatsService {
  constructor(private readonly userStatsRepository: UserStatsRepository) {}

  async getUserStats(userId: string): Promise<UserStats> {
    const stats = await this.userStatsRepository.findByUserId(userId);
    if (!stats) {
      throw new Error(`Stats not found for user ${userId}`);
    }
    return stats;
  }

  async updateUserStats(
    userId: string, 
    weight?: number, 
    height?: number
  ): Promise<UserStats> {
    const existingStats = await this.userStatsRepository.findByUserId(userId);
    
    if (!existingStats) {
      throw new Error(`Stats not found for user ${userId}`);
    }

    const newWeight = weight ?? existingStats.currentWeight;
    const newHeight = height ?? existingStats.currentHeight;
    const newBMI = this.calculateBMI(newWeight, newHeight);

    const updates = {
      currentWeight: newWeight,
      currentHeight: newHeight,
      bmi: newBMI,
      lastUpdated: new Date()
    };

    return await this.userStatsRepository.update(userId, updates);
  }

  async createUserStats(
    userId: string,
    weight: number,
    height: number
  ): Promise<UserStats> {
    const bmi = this.calculateBMI(weight, height);
    
    const newStats = {
      userId,
      currentWeight: weight,
      currentHeight: height,
      bmi,
      lastUpdated: new Date()
    };

    return await this.userStatsRepository.save(newStats);
  }

  private calculateBMI(weight: number, height: number): number {
    return Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;
  }
}
