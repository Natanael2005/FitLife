import { UserStats } from "../../domain/entities/UserStats";
import { StatsNotFound } from "../../domain/exceptions/StatsNotFound";
import { GetUserStatsUseCase } from "../ports/input/GetUserStatsUseCase";
import { UpdateUserStatsUseCase } from "../ports/input/UpdateUserStatsUseCase";
import { UserStatsRepository } from "../ports/output/UserStatsRepository";

export class UserStatsService implements GetUserStatsUseCase, UpdateUserStatsUseCase {
  constructor(private readonly userStatsRepository: UserStatsRepository) {}

  execute(userId: string): Promise<UserStats> {
    throw new Error("Method not implemented.");
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const stats = await this.userStatsRepository.findByUserId(userId);
    if (!stats) {
      throw new StatsNotFound(`Stats not found for user ${userId}`);
    }
    return stats;
  }

  async updateUserStats(userId: string, statsUpdate: Partial<UserStats>): Promise<UserStats> {
    const existingStats = await this.userStatsRepository.findByUserId(userId);

    if (!existingStats) {
      return await this.createUserStats(userId, statsUpdate);
    }

    const updates = {
      ...statsUpdate,
      bmi: statsUpdate.currentWeight && statsUpdate.currentHeight ?
        this.calculateBMI(statsUpdate.currentWeight, statsUpdate.currentHeight) :
        (statsUpdate.currentWeight ?
          this.calculateBMI(statsUpdate.currentWeight, existingStats.currentHeight) :
          existingStats.bmi),
      lastUpdated: new Date()
    };

    return await this.userStatsRepository.update(userId, updates);
  }

  async createUserStats(userId: string, statsData: Partial<UserStats>): Promise<UserStats> {
    const bmi = statsData.currentWeight && statsData.currentHeight ?
      this.calculateBMI(statsData.currentWeight, statsData.currentHeight) : 0;

    const newStatsData = {
      userId,
      currentWeight: statsData.currentWeight || 0,
      targetWeight: statsData.targetWeight || 0,
      currentHeight: statsData.currentHeight || 0,
      workoutStreak: statsData.workoutStreak || 0,
      totalWorkouts: statsData.totalWorkouts || 0,
      totalCaloriesBurned: statsData.totalCaloriesBurned || 0,
      averageWorkoutDuration: statsData.averageWorkoutDuration || 0,
      bmi,
      lastUpdated: new Date(),
      weeklyGoalProgress: statsData.weeklyGoalProgress || 0
      // No agregues métodos aquí
    } as Omit<UserStats, "id" | "createdAt">;

    return await this.userStatsRepository.save(newStatsData);
  }

  private calculateBMI(weight: number, height: number): number {
    return weight / Math.pow(height / 100, 2);
  }
}