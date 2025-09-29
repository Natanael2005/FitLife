import { Pool } from 'pg';
import { UserStats } from '../../../../domain/entities/UserStats';
import { UserStatsRepository } from '../../../../application/ports/output/UserStatsRepository';

export class PostgresUserStatsRepository implements UserStatsRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<UserStats | null> {
    const query = `
      SELECT id, user_id, current_weight, target_weight, current_height, 
             workout_streak, total_workouts, total_calories_burned, 
             average_workout_duration, bmi, last_updated, weekly_goal_progress, created_at
      FROM user_stats 
      WHERE user_id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new UserStats(
      row.id,
      row.user_id,
      row.current_weight,
      row.target_weight,
      row.current_height,
      row.workout_streak,
      row.total_workouts,
      row.total_calories_burned,
      row.average_workout_duration,
      row.bmi,
      row.last_updated,
      row.weekly_goal_progress,
      row.created_at
    );
  }

  async save(userStats: Omit<UserStats, 'id' | 'createdAt'>): Promise<UserStats> {
    const query = `
      INSERT INTO user_stats (
        user_id, current_weight, target_weight, current_height, 
        workout_streak, total_workouts, total_calories_burned, 
        average_workout_duration, bmi, last_updated, weekly_goal_progress
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      userStats.userId,
      userStats.currentWeight,
      userStats.targetWeight,
      userStats.currentHeight,
      userStats.workoutStreak,
      userStats.totalWorkouts,
      userStats.totalCaloriesBurned,
      userStats.averageWorkoutDuration,
      userStats.bmi,
      userStats.lastUpdated,
      userStats.weeklyGoalProgress
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new UserStats(
      row.id,
      row.user_id,
      row.current_weight,
      row.target_weight,
      row.current_height,
      row.workout_streak,
      row.total_workouts,
      row.total_calories_burned,
      row.average_workout_duration,
      row.bmi,
      row.last_updated,
      row.weekly_goal_progress,
      row.created_at
    );
  }

  async update(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    const setClause: string[] = [];
    const values: (string | number | Date)[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
          if (
            value !== undefined &&
            key !== 'id' &&
            key !== 'userId' &&
            key !== 'createdAt' &&
            typeof value !== 'function'
          ) {
            const dbColumn = this.camelToSnake(key);
            setClause.push(`${dbColumn} = $${paramCount++}`);
            values.push(value);
          }
        });

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const query = `
      UPDATE user_stats 
      SET ${setClause.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`UserStats not found for userId: ${userId}`);
    }

    const row = result.rows[0];
    return new UserStats(
      row.id,
      row.user_id,
      row.current_weight,
      row.target_weight,
      row.current_height,
      row.workout_streak,
      row.total_workouts,
      row.total_calories_burned,
      row.average_workout_duration,
      row.bmi,
      row.last_updated,
      row.weekly_goal_progress,
      row.created_at
    );
  }

  async delete(userId: string): Promise<void> {
    const query = 'DELETE FROM user_stats WHERE user_id = $1';
    await this.pool.query(query, [userId]);
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
