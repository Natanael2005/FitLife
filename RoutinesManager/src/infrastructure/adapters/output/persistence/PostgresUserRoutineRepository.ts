import { Pool } from 'pg';
import { UserRoutine } from '../../../../domain/entities/UserRoutine';
import { UserRoutineRepository } from '../../../../application/ports/output/UserRoutineRepository';

export class PostgresUserRoutineRepository implements UserRoutineRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserId(usuario_id: string): Promise<UserRoutine[]> {
    const query = `
      SELECT id, usuario_id, nombre, dias, ejercicios, alimentos, created_at, updated_at
      FROM user_routines 
      WHERE usuario_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await this.pool.query(query, [usuario_id]);
    
    return result.rows.map(row => new UserRoutine(
      row.id,
      row.usuario_id,
      row.nombre,
      row.dias,
      row.ejercicios,
      row.alimentos,
      row.created_at,
      row.updated_at
    ));
  }

  async findById(id: string): Promise<UserRoutine | null> {
    const query = `
      SELECT id, usuario_id, nombre, dias, ejercicios, alimentos, created_at, updated_at
      FROM user_routines 
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.nombre,
      row.dias,
      row.ejercicios,
      row.alimentos,
      row.created_at,
      row.updated_at
    );
  }

  async findByUserAndRoutine(usuario_id: string, rutina_id: string): Promise<UserRoutine | null> {
    const query = `
      SELECT id, usuario_id, nombre, dias, ejercicios, alimentos, created_at, updated_at
      FROM user_routines 
      WHERE usuario_id = $1 AND id = $2
    `;
    
    const result = await this.pool.query(query, [usuario_id, rutina_id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.nombre,
      row.dias,
      row.ejercicios,
      row.alimentos,
      row.created_at,
      row.updated_at
    );
  }

  async save(userRoutine: Partial<UserRoutine>): Promise<UserRoutine> {
    const query = `
      INSERT INTO user_routines (id, usuario_id, nombre, dias, ejercicios, alimentos, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, usuario_id, nombre, dias, ejercicios, alimentos, created_at, updated_at
    `;

    const result = await this.pool.query(query, [
      userRoutine.id || this.generateId(),
      userRoutine.usuario_id,
      userRoutine.nombre,
      userRoutine.dias,
      JSON.stringify(userRoutine.ejercicios || []),
      JSON.stringify(userRoutine.alimentos || [])
    ]);

    const row = result.rows[0];
    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.nombre,
      row.dias,
      row.ejercicios,
      row.alimentos,
      row.created_at,
      row.updated_at
    );
  }

  async update(id: string, userRoutine: Partial<UserRoutine>): Promise<UserRoutine> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userRoutine.nombre !== undefined) {
      updates.push(`nombre = $${paramIndex++}`);
      values.push(userRoutine.nombre);
    }
    if (userRoutine.dias !== undefined) {
      updates.push(`dias = $${paramIndex++}`);
      values.push(userRoutine.dias);
    }
    if (userRoutine.ejercicios !== undefined) {
      updates.push(`ejercicios = $${paramIndex++}`);
      values.push(JSON.stringify(userRoutine.ejercicios));
    }
    if (userRoutine.alimentos !== undefined) {
      updates.push(`alimentos = $${paramIndex++}`);
      values.push(JSON.stringify(userRoutine.alimentos));
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE user_routines 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, usuario_id, nombre, dias, ejercicios, alimentos, created_at, updated_at
    `;
    
    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new UserRoutine(
      row.id,
      row.usuario_id,
      row.nombre,
      row.dias,
      row.ejercicios,
      row.alimentos,
      row.created_at,
      row.updated_at
    );
  }

  async delete(id: string): Promise<void> {
    const query = `DELETE FROM user_routines WHERE id = $1`;
    await this.pool.query(query, [id]);
  }

  private generateId(): string {
    return `routine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}