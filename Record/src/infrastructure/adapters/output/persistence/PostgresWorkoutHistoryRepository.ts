import { Pool } from 'pg';
import { WorkoutHistory } from '../../../../domain/entities/WorkoutHistory';
import { WorkoutHistoryRepository } from '../../../../application/ports/output/WorkoutHistoryRepository';

export class PostgresWorkoutHistoryRepository implements WorkoutHistoryRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<WorkoutHistory[]> {
    const query = `
      SELECT id, user_id, routine_name, routine_id, completed_at, created_at
      FROM workout_history 
      WHERE user_id = $1
      ORDER BY completed_at DESC
    `;
    
    const result = await this.pool.query(query, [userId]);
    
    return result.rows.map(row => new WorkoutHistory(
      row.id,
      row.user_id,
      row.routine_name,
      row.routine_id,
      row.completed_at,
      row.created_at
    ));
  }

  async findByUserIdWithPagination(
    userId: string,
    limit: number,
    offset: number
  ): Promise<WorkoutHistory[]> {
    const query = `
      SELECT id, user_id, routine_name, routine_id, completed_at, created_at
      FROM workout_history 
      WHERE user_id = $1
      ORDER BY completed_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.pool.query(query, [userId, limit, offset]);
    
    return result.rows.map(row => new WorkoutHistory(
      row.id,
      row.user_id,
      row.routine_name,
      row.routine_id,
      row.completed_at,
      row.created_at
    ));
  }

  async save(history: Omit<WorkoutHistory, 'id' | 'createdAt'>): Promise<WorkoutHistory> {
    const query = `
      INSERT INTO workout_history (
        user_id, routine_name, routine_id, completed_at
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      history.userId,
      history.routineName,
      history.routineId,
      history.completedAt
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new WorkoutHistory(
      row.id,
      row.user_id,
      row.routine_name,
      row.routine_id,
      row.completed_at,
      row.created_at
    );
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM workout_history WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async countByUserId(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM workout_history WHERE user_id = $1';
    const result = await this.pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}

export const createWorkoutHistoryTable = `
  CREATE TABLE IF NOT EXISTS workout_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    routine_name VARCHAR(255) NOT NULL,
    routine_id VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_workout_history_completed_at ON workout_history(completed_at);
`;
