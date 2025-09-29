import { SaveActivityUseCase } from '../ports/input/SaveActivityUseCase';
import { GetHistoryUseCase, HistoryFilters } from '../ports/input/GetHistoryUseCase';
import { ActivityRepository } from '../ports/output/ActivityRepository';
import { Activity } from '../../domain/entities/Activity';
import { StatsService } from '../ports/output/StatsService';

export class HistoryService implements SaveActivityUseCase, GetHistoryUseCase {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly statsService: StatsService
  ) {}

  async execute(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const savedActivity = await this.activityRepository.save(activity);
    
    await this.statsService.updateUserStats(activity.userId, {
      totalWorkouts: activity.type === 'workout' ? 1 : 0,
      totalCaloriesBurned: activity.caloriesBurned,
      lastActivityDate: activity.date
    });

    return savedActivity;
  }

  async getHistory(userId: string, filters?: HistoryFilters): Promise<Activity[]> {
    return await this.activityRepository.findByUserId(userId, filters);
  }

  async generateUserReport(userId: string, period: 'week' | 'month'): Promise<UserReport> {
    const summary = await this.activityRepository.getActivitySummary(userId, period);
    const activities = await this.activityRepository.findByUserId(userId, {
      startDate: this.getStartDate(period),
      endDate: new Date()
    });

    return new UserReport(
      userId,
      period,
      summary,
      activities,
      this.calculateTrends(activities)
    );
  }

  private getStartDate(period: 'week' | 'month'): Date {
    const now = new Date();
    if (period === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  private calculateTrends(activities: Activity[]): ActivityTrends {
    return {
      workoutFrequency: 'increasing',
      caloriesTrend: 'stable',
      durationTrend: 'increasing'
    };
  }
}

class UserReport {
  constructor(
    public readonly userId: string,
    public readonly period: string,
    public readonly summary: any,
    public readonly activities: Activity[],
    public readonly trends: ActivityTrends
  ) {}
}

interface ActivityTrends {
  workoutFrequency: 'increasing' | 'decreasing' | 'stable';
  caloriesTrend: 'increasing' | 'decreasing' | 'stable';
  durationTrend: 'increasing' | 'decreasing' | 'stable';
}
