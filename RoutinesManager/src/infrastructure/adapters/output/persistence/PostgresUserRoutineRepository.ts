import { Pool } from 'pg';
import { UserRoutine } from '../../../../domain/entities/UserRoutine';
import { UserRoutineRepository } from '../../../../application/ports/output/UserRoutineRepository';

export class PostgresUserRoutineRepository implements UserRoutineRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserId(usuario_id: string): Promise<UserRoutine[]> {
  const query = `
    SELECT id, usuario_id, rutina_id, assigned_at, is_active, created_at
    FROM routine_assignments 
    WHERE usuario_id = $1 AND is_active = true
    ORDER BY assigned_at DESC
  `;

    
    const result = await this.pool.query(query, [usuario_id]);
    
    return result.rows.map(row => new UserRoutine(
      row.id,
      row.usuario_id,
      row.rutina_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    ));
  }

  async findByUserAndRoutine(usuario_id: string, rutina_id: string): Promise<UserRoutine | null> {
  const query = `
    SELECT id, usuario_id, rutina_id, assigned_at, is_active, created_at
    FROM routine_assignments 
    WHERE usuario_id = $1 AND rutina_id = $2
  `;
    
    const result = await this.pool.query(query, [usuario_id, rutina_id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.rutina_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    );
  }

  async save(usuario_id: string, rutina_id: string): Promise<UserRoutine> {
  const query = `
    INSERT INTO routine_assignments (usuario_id, rutina_id, assigned_at, is_active)
    VALUES ($1, $2, NOW(), true)
    RETURNING id, usuario_id, rutina_id, assigned_at, is_active, created_at
  `;

    const result = await this.pool.query(query, [usuario_id, rutina_id]);
    const row = result.rows[0];

    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.rutina_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    );
  }

  async delete(usuario_id: string, rutina_id: string): Promise<void> {
  const query = `
    UPDATE routine_assignments 
    SET is_active = false 
    WHERE usuario_id = $1 AND rutina_id = $2
  `;
    
    await this.pool.query(query, [usuario_id, rutina_id]);
  }

  async updateStatus(id: number, isActive: boolean): Promise<UserRoutine> {
  const query = `
    UPDATE routine_assignments 
    SET is_active = $2, assigned_at = NOW()
    WHERE id = $1
    RETURNING id, usuario_id, rutina_id, assigned_at, is_active, created_at
  `;
    
    const result = await this.pool.query(query, [id, isActive]);
    const row = result.rows[0];

    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.rutina_id,
      row.assigned_at,
      row.is_active,
      row.created_at
    );
  }
}