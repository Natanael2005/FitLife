import { Activity } from '../../../domain/entities/Activity';
import { HistoryFilters } from '../input/GetHistoryUseCase';

export interface ActivityRepository {
  save(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;
  findByUserId(userId: string, filters?: HistoryFilters): Promise<Activity[]>;
  findById(id: number): Promise<Activity | null>;
  delete(id: number): Promise<void>;
  getActivitySummary(userId: string, period: 'week' | 'month'): Promise<ActivitySummary>;
}

export interface ActivitySummary {
  totalActivities: number;
  totalDuration: number;
  totalCaloriesBurned: number;
  workoutCount: number;
  nutritionCount: number;
  averageDuration: number;
}
