import { WorkoutHistory } from '../../../domain/entities/WorkoutHistory';

export interface WorkoutHistoryRepository {
  findByUserId(userId: string): Promise<WorkoutHistory[]>;
  findByUserIdWithPagination(
    userId: string, 
    limit: number, 
    offset: number
  ): Promise<WorkoutHistory[]>;
  save(history: Omit<WorkoutHistory, 'id' | 'createdAt'>): Promise<WorkoutHistory>;
  delete(id: number): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
