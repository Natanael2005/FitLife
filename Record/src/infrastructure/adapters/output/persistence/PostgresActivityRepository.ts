import { Pool } from 'pg';
import { Activity } from '../../../../domain/entities/Activity';
import { ActivityType } from '../../../../domain/value-objects/ActivityType';
import { ActivityRepository, ActivitySummary } from '../../../../application/ports/output/ActivityRepository';
import { HistoryFilters } from '../../../../application/ports/input/GetHistoryUseCase';

export class PostgresActivityRepository implements ActivityRepository {
  constructor(private readonly pool: Pool) {}

  async save(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const query = `
      INSERT INTO activities (user_id, type, name, duration, calories_burned, date, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      activity.userId,
      activity.type,
      activity.name,
      activity.duration,
      activity.caloriesBurned,
      activity.date,
      JSON.stringify(activity.metadata)
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new Activity(
      row.id,
      row.user_id,
      row.type,
      row.name,
      row.duration,
      row.calories_burned,
      row.date,
      JSON.parse(row.metadata || '{}'),
      row.created_at
    );
  }

  async findByUserId(userId: string, filters?: HistoryFilters): Promise<Activity[]> {
    let query = `
      SELECT id, user_id, type, name, duration, calories_burned, date, metadata, created_at
      FROM activities 
      WHERE user_id = $1
    `;
    
    const values: any[] = [userId];
    let paramCount = 2;

    if (filters?.startDate) {
      query += ` AND date >= $${paramCount++}`;
      values.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND date <= $${paramCount++}`;
      values.push(filters.endDate);
    }

    if (filters?.activityType) {
      query += ` AND type = $${paramCount++}`;
      values.push(filters.activityType);
    }

    query += ` ORDER BY date DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(filters.limit);
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(filters.offset);
    }

    const result = await this.pool.query(query, values);

    return result.rows.map(row => new Activity(
      row.id,
      row.user_id,
      row.type,
      row.name,
      row.duration,
      row.calories_burned,
      row.date,
      JSON.parse(row.metadata || '{}'),
      row.created_at
    ));
  }

  async findById(id: number): Promise<Activity | null> {
    const query = `
      SELECT id, user_id, type, name, duration, calories_burned, date, metadata, created_at
      FROM activities 
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Activity(
      row.id,
      row.user_id,
      row.type,
      row.name,
      row.duration,
      row.calories_burned,
      row.date,
      JSON.parse(row.metadata || '{}'),
      row.created_at
    );
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM activities WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async getActivitySummary(userId: string, period: 'week' | 'month'): Promise<ActivitySummary> {
    const startDate = this.getStartDate(period);
    
    const query = `
      SELECT 
        COUNT(*) as total_activities,
        SUM(duration) as total_duration,
        SUM(calories_burned) as total_calories_burned,
        COUNT(CASE WHEN type = 'workout' THEN 1 END) as workout_count,
        COUNT(CASE WHEN type = 'nutrition' THEN 1 END) as nutrition_count,
        AVG(duration) as average_duration
      FROM activities 
      WHERE user_id = $1 AND date >= $2
    `;

    const result = await this.pool.query(query, [userId, startDate]);
    const row = result.rows[0];

    return {
      totalActivities: parseInt(row.total_activities || '0'),
      totalDuration: parseFloat(row.total_duration || '0'),
      totalCaloriesBurned: parseFloat(row.total_calories_burned || '0'),
      workoutCount: parseInt(row.workout_count || '0'),
      nutritionCount: parseInt(row.nutrition_count || '0'),
      averageDuration: parseFloat(row.average_duration || '0')
    };
  }

  private getStartDate(period: 'week' | 'month'): Date {
    const now = new Date();
    if (period === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}
