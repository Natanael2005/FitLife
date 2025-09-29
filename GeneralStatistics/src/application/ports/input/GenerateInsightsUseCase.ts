import { PopularRoutine } from "../../../domain/entities/PopularRoutine";

export interface GenerateInsightsUseCase {
  generateInsights(period: 'week' | 'month' | 'quarter'): Promise<SystemInsights>;
}

export interface SystemInsights {
  userGrowthTrend: 'increasing' | 'decreasing' | 'stable';
  mostPopularWorkoutTime: string;
  topPerformingRoutines: PopularRoutine[];
  engagementTrends: EngagementTrends;
  recommendations: string[];
}

interface EngagementTrends {
  weekOverWeek: number;
  monthOverMonth: number;
  seasonalPattern: string;
}
