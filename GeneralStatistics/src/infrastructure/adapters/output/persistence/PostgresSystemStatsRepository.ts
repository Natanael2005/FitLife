import { Pool } from 'pg';
import { SystemStats } from '../../../../domain/entities/SystemStats';
import { PopularRoutine } from '../../../../domain/entities/PopularRoutine';
import { UserDemographics } from '../../../../domain/entities/UserDemographics';
import { EngagementMetrics } from '../../../../domain/value-objects/EngagementMetrics';
import { SystemStatsRepository } from '../../../../application/ports/output/SystemStatsRepository';

export class PostgresSystemStatsRepository implements SystemStatsRepository {
  constructor(private readonly pool: Pool) {}

  async getCurrentStats(): Promise<SystemStats | null> {
    const query = `
      SELECT id, total_users, active_users, total_workouts, total_calories_burned,
             average_session_time, popular_routines, user_demographics, 
             engagement_metrics, timestamp, created_at
      FROM system_stats 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(query);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new SystemStats(
      row.id,
      row.total_users,
      row.active_users,
      row.total_workouts,
      row.total_calories_burned,
      row.average_session_time,
      JSON.parse(row.popular_routines || '[]'),
      JSON.parse(row.user_demographics || '{}'),
      JSON.parse(row.engagement_metrics || '{}'),
      row.timestamp,
      row.created_at
    );
  }

  async getPopularRoutines(limit: number): Promise<PopularRoutine[]> {
   
    return [
      new PopularRoutine('1', 'Full Body Workout', 'strength', 150, 4.5, 45, 10),
      new PopularRoutine('2', 'HIIT Cardio', 'cardio', 120, 4.3, 30, 8),
      new PopularRoutine('3', 'Yoga Flow', 'flexibility', 100, 4.7, 60, 15)
    ];
  }

  async getUserDemographics(): Promise<UserDemographics> {
    return new UserDemographics(
      [
        { ageRange: '18-25', count: 150, percentage: 30 },
        { ageRange: '26-35', count: 200, percentage: 40 },
        { ageRange: '36-45', count: 100, percentage: 20 },
        { ageRange: '46+', count: 50, percentage: 10 }
      ],
      { male: 250, female: 200, other: 50 },
      [
        { country: 'Mexico', userCount: 300, percentage: 60 },
        { country: 'USA', userCount: 150, percentage: 30 },
        { country: 'Others', userCount: 50, percentage: 10 }
      ],
      [
        { level: 'beginner', count: 200, percentage: 40 },
        { level: 'intermediate', count: 250, percentage: 50 },
        { level: 'advanced', count: 50, percentage: 10 }
      ]
    );
  }

  async getEngagementMetrics(): Promise<EngagementMetrics> {
    return new EngagementMetrics(
      150, 
      400, 
      500, 
      3.5, 
      0.75, 
      0.25
    );
  }

  async saveStatsSnapshot(stats: Omit<SystemStats, 'id' | 'createdAt'>): Promise<SystemStats> {
    const query = `
      INSERT INTO system_stats (
        total_users, active_users, total_workouts, total_calories_burned,
        average_session_time, popular_routines, user_demographics, 
        engagement_metrics, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      stats.totalUsers,
      stats.activeUsers,
      stats.totalWorkouts,
      stats.totalCaloriesBurned,
      stats.averageSessionTime,
      JSON.stringify(stats.popularRoutines),
      JSON.stringify(stats.userDemographics),
      JSON.stringify(stats.engagementMetrics),
      stats.timestamp
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new SystemStats(
      row.id,
      row.total_users,
      row.active_users,
      row.total_workouts,
      row.total_calories_burned,
      row.average_session_time,
      JSON.parse(row.popular_routines),
      JSON.parse(row.user_demographics),
      JSON.parse(row.engagement_metrics),
      row.timestamp,
      row.created_at
    );
  }

  async getStatsByPeriod(startDate: Date, endDate: Date): Promise<SystemStats[]> {
    const query = `
      SELECT id, total_users, active_users, total_workouts, total_calories_burned,
             average_session_time, popular_routines, user_demographics, 
             engagement_metrics, timestamp, created_at
      FROM system_stats 
      WHERE timestamp BETWEEN $1 AND $2
      ORDER BY timestamp ASC
    `;

    const result = await this.pool.query(query, [startDate, endDate]);

    return result.rows.map(row => new SystemStats(
      row.id,
      row.total_users,
      row.active_users,
      row.total_workouts,
      row.total_calories_burned,
      row.average_session_time,
      JSON.parse(row.popular_routines || '[]'),
      JSON.parse(row.user_demographics || '{}'),
      JSON.parse(row.engagement_metrics || '{}'),
      row.timestamp,
      row.created_at
    ));
  }
}
