import { SystemStats } from '../../../domain/entities/SystemStats';
import { PopularRoutine } from '../../../domain/entities/PopularRoutine';
import { UserDemographics } from '../../../domain/entities/UserDemographics';
import { EngagementMetrics } from '../../../domain/value-objects/EngagementMetrics';

export interface SystemStatsRepository {
  getCurrentStats(): Promise<SystemStats | null>;
  getPopularRoutines(limit: number): Promise<PopularRoutine[]>;
  getUserDemographics(): Promise<UserDemographics>;
  getEngagementMetrics(): Promise<EngagementMetrics>;
  saveStatsSnapshot(stats: Omit<SystemStats, 'id' | 'createdAt'>): Promise<SystemStats>;
  getStatsByPeriod(startDate: Date, endDate: Date): Promise<SystemStats[]>;
}
