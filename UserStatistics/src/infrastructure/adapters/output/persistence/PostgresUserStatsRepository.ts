import { Pool } from 'pg';
import { UserStats } from '../../../../domain/entities/UserStats';
import { UserStatsRepository } from '../../../../application/ports/output/UserStatsRepository';

export class PostgresUserStatsRepository implements UserStatsRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<UserStats | null> {
    const query = `
      SELECT id, user_id, current_weight, current_height, 
             bmi, last_updated, created_at
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
      row.current_height,
      row.bmi,
      row.last_updated,
      row.created_at
    );
  }

  async save(userStats: Omit<UserStats, 'id' | 'createdAt'>): Promise<UserStats> {
    const query = `
      INSERT INTO user_stats (
        user_id, current_weight, current_height, bmi, last_updated
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      userStats.userId,
      userStats.currentWeight,
      userStats.currentHeight,
      userStats.bmi,
      userStats.lastUpdated
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new UserStats(
      row.id,
      row.user_id,
      row.current_weight,
      row.current_height,
      row.bmi,
      row.last_updated,
      row.created_at
    );
  }

  async update(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    const query = `
      UPDATE user_stats 
      SET current_weight = COALESCE($1, current_weight),
          current_height = COALESCE($2, current_height),
          bmi = COALESCE($3, bmi),
          last_updated = $4
      WHERE user_id = $5
      RETURNING *
    `;

    const values = [
      updates.currentWeight,
      updates.currentHeight,
      updates.bmi,
      updates.lastUpdated || new Date(),
      userId
    ];

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`UserStats not found for userId: ${userId}`);
    }

    const row = result.rows[0];
    return new UserStats(
      row.id,
      row.user_id,
      row.current_weight,
      row.current_height,
      row.bmi,
      row.last_updated,
      row.created_at
    );
  }

  async delete(userId: string): Promise<void> {
    const query = 'DELETE FROM user_stats WHERE user_id = $1';
    await this.pool.query(query, [userId]);
  }
}

export const createUserStatsTable = `
  CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    current_height DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(4,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_stats_last_updated ON user_stats(last_updated);
`;
