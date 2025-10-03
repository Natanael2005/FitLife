import { Pool } from 'pg';
import { UserRoutine } from '../../../../domain/entities/UserRoutine';
import { UserRoutineRepository } from '../../../../application/ports/output/UserRoutineRepository';

export class PostgresUserRoutineRepository implements UserRoutineRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<UserRoutine[]> {
    const query = `
      SELECT id, user_id, routine_id, assigned_at, is_active, created_at
      FROM user_routines 
      WHERE user_id = $1 AND is_active = true
      ORDER BY assigned_at DESC
    `;
    
    const result = await this.pool.query(query, [userId]);
    
    return result.rows.map(row => new UserRoutine(
      row.id,
      row.user_id,
      row.routine_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    ));
  }

  async findByUserAndRoutine(userId: string, routineId: string): Promise<UserRoutine | null> {
    const query = `
      SELECT id, user_id, routine_id, assigned_at, is_active, created_at
      FROM user_routines 
      WHERE user_id = $1 AND routine_id = $2
    `;
    
    const result = await this.pool.query(query, [userId, routineId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new UserRoutine(
      row.id,
      row.user_id,
      row.routine_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    );
  }

  async save(userId: string, routineId: string): Promise<UserRoutine> {
    const query = `
      INSERT INTO user_routines (user_id, routine_id, assigned_at, is_active)
      VALUES ($1, $2, NOW(), true)
      RETURNING id, user_id, routine_id, assigned_at, is_active, created_at
    `;

    const result = await this.pool.query(query, [userId, routineId]);
    const row = result.rows[0];

    return new UserRoutine(
      row.id,
      row.user_id,
      row.routine_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    );
  }

  async delete(userId: string, routineId: string): Promise<void> {
    const query = `
      UPDATE user_routines 
      SET is_active = false 
      WHERE user_id = $1 AND routine_id = $2
    `;
    
    await this.pool.query(query, [userId, routineId]);
  }

  async updateStatus(id: number, isActive: boolean): Promise<UserRoutine> {
    const query = `
      UPDATE user_routines 
      SET is_active = $2, assigned_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, routine_id, assigned_at, is_active, created_at
    `;
    
    const result = await this.pool.query(query, [id, isActive]);
    const row = result.rows[0];

    return new UserRoutine(
      row.id,
      row.user_id,
      row.routine_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    );
  }
}
