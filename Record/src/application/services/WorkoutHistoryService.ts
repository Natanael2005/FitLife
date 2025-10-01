import { WorkoutHistoryRepository } from '../ports/output/WorkoutHistoryRepository';
import { WorkoutHistory } from '../../domain/entities/WorkoutHistory';

export class WorkoutHistoryService {
  constructor(
    private readonly historyRepository: WorkoutHistoryRepository
  ) {}

  async getHistory(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<WorkoutHistory[]> {
    return await this.historyRepository.findByUserIdWithPagination(
      userId, 
      limit, 
      offset
    );
  }

  async addWorkout(
    userId: string,
    routineName: string,
    routineId: string,
    completedAt?: Date
  ): Promise<WorkoutHistory> {
    const newHistory = {
      userId,
      routineName,
      routineId,
      completedAt: completedAt || new Date()
    };

    return await this.historyRepository.save(newHistory);
  }

  async getTotalWorkouts(userId: string): Promise<number> {
    return await this.historyRepository.countByUserId(userId);
  }

  async deleteWorkout(id: number): Promise<void> {
    await this.historyRepository.delete(id);
  }
}
