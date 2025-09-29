import { GetSystemStatsUseCase } from '../ports/input/GetSystemStatsUseCase';
import { GenerateInsightsUseCase, SystemInsights } from '../ports/input/GenerateInsightsUseCase';
import { SystemStatsRepository } from '../ports/output/SystemStatsRepository';
import { UserRepository } from '../ports/output/UserRepository';
import { RoutineRepository } from '../ports/output/RoutineRepository';
import { SystemStats } from '../../domain/entities/SystemStats';
import { PopularRoutine } from '../../domain/entities/PopularRoutine';
import { EngagementMetrics } from '../../domain/value-objects/EngagementMetrics';

export class GeneralStatsService implements GetSystemStatsUseCase, GenerateInsightsUseCase {
  constructor(
    private readonly systemStatsRepository: SystemStatsRepository,
    private readonly userRepository: UserRepository,
    private readonly routineRepository: RoutineRepository
  ) {}

  async execute(): Promise<SystemStats> {
    const [
      totalUsers,
      activeUsers,
      totalWorkouts,
      popularRoutines,
      demographics,
      engagementMetrics
    ] = await Promise.all([
      this.userRepository.getTotalUserCount(),
      this.userRepository.getActiveUserCount(),
      this.userRepository.getTotalWorkoutCount(),
      this.systemStatsRepository.getPopularRoutines(10),
      this.systemStatsRepository.getUserDemographics(),
      this.systemStatsRepository.getEngagementMetrics()
    ]);

    const systemStats = new SystemStats(
      0,
      totalUsers,
      activeUsers,
      totalWorkouts,
      await this.calculateTotalCaloriesBurned(),
      await this.calculateAverageSessionTime(),
      popularRoutines,
      demographics,
      engagementMetrics,
      new Date(),
      new Date()
    );

    
    await this.systemStatsRepository.saveStatsSnapshot(systemStats);

    return systemStats;
  }

  
  async generateInsights(period: 'week' | 'month' | 'quarter'): Promise<SystemInsights> {
    const currentStats = await this.execute();
    const previousStats = await this.getPreviousPeriodStats(period);

    return {
      userGrowthTrend: this.calculateGrowthTrend(currentStats.totalUsers, previousStats?.totalUsers),
      mostPopularWorkoutTime: await this.getMostPopularWorkoutTime(period),
      topPerformingRoutines: currentStats.popularRoutines.slice(0, 5),
      engagementTrends: {
        weekOverWeek: this.calculateEngagementChange(currentStats, previousStats, 'week'),
        monthOverMonth: this.calculateEngagementChange(currentStats, previousStats, 'month'),
        seasonalPattern: await this.getSeasonalPattern()
      },
      recommendations: this.generateRecommendations(currentStats, previousStats)
    };
  }

  private async calculateTotalCaloriesBurned(): Promise<number> {
    return 1500000; 
  }

  private async calculateAverageSessionTime(): Promise<number> {
    return 45;
  }

  private async getPreviousPeriodStats(period: string): Promise<SystemStats | null> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        return null;
    }

    const endDate = new Date(now.getTime() - (period === 'week' ? 7 : period === 'month' ? 30 : 90) * 24 * 60 * 60 * 1000);
    const stats = await this.systemStatsRepository.getStatsByPeriod(startDate, endDate);
    
    return stats.length > 0 ? stats[stats.length - 1] : null;
  }

  private calculateGrowthTrend(current: number, previous?: number): 'increasing' | 'decreasing' | 'stable' {
    if (!previous) return 'stable';
    
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private async getMostPopularWorkoutTime(period: string): Promise<string> {
    return '18:00-19:00';
  }

  private calculateEngagementChange(current: SystemStats, previous: SystemStats | null, period: string): number {
    if (!previous) return 0;
    
    const currentEngagement = current.engagementMetrics.getEngagementScore();
    const previousEngagement = previous.engagementMetrics.getEngagementScore();
    
    return ((currentEngagement - previousEngagement) / previousEngagement) * 100;
  }

  private async getSeasonalPattern(): Promise<string> {
    return 'Higher activity in January and September'; 
  }

  private generateRecommendations(current: SystemStats, previous: SystemStats | null): string[] {
    const recommendations: string[] = [];

    if (current.getActiveUserPercentage() < 60) {
      recommendations.push('Implementar programa de engagement para usuarios inactivos');
    }

    if (current.engagementMetrics.retentionRate < 0.7) {
      recommendations.push('Mejorar onboarding y experiencia inicial de usuarios');
    }

    if (current.popularRoutines.length < 5) {
      recommendations.push('Crear más rutinas populares y diversificar catálogo');
    }

    return recommendations;
  }
}
