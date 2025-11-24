import { Pool } from 'pg';
import { Exercise } from '../../../../domain/entities/Exercise';
import { ExerciseRepository } from '../../../../application/ports/output/ExerciseRepository';
import { ExerciseFilters } from '../../../../application/ports/input/GetExercisesUseCase';

export class PostgresExerciseRepository implements ExerciseRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(filters?: ExerciseFilters): Promise<Exercise[]> {
    let query = `
      SELECT id, nombre, categoria, contraindicaciones, nivel,
             series_recomendadas, repeticiones_recomendadas, gif_url,
             musculo_principal, musculo_secundario, instrucciones,
             activo , created_at
      FROM exercises 
      WHERE activo = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.categoria) {
      query += ` AND categoria = $${paramCount++}`;
      params.push(filters.categoria);
    }

    if (filters?.nivel) {
      query += ` AND $${paramCount++} = ANY(nivel)`;
      params.push(filters.nivel);
    }

    if (filters?.musculo_principal) {
      query += ` AND musculo_principal ILIKE $${paramCount++}`;
      params.push(`%${filters.musculo_principal}%`);
    }

    if (filters?.search) {
      query += ` AND (nombre ILIKE $${paramCount++} OR categoria ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY nombre ASC';

    const result = await this.pool.query(query, params);
    
    return result.rows.map(row => new Exercise(
      row.id,
      row.nombre,
      row.categoria,
      row.contraindicaciones,
      row.nivel,
      row.series_recomendadas,
      row.repeticiones_recomendadas,
      row.gif_url,
      row.musculo_principal,
      row.musculo_secundario,
      row.instrucciones,
      row.activo,
      row.created_at
    ));
  }

  async findById(id: string): Promise<Exercise | null> {
    const query = `
      SELECT id, nombre, categoria, contraindicaciones, nivel,
             series_recomendadas, repeticiones_recomendadas, gif_url,
             musculo_principal, musculo_secundario, instrucciones,
             activo, created_at
      FROM exercises 
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Exercise(
      row.id,
      row.nombre,
      row.categoria,
      row.contraindicaciones,
      row.nivel,
      row.series_recomendadas,
      row.repeticiones_recomendadas,
      row.gif_url,
      row.musculo_principal,
      row.musculo_secundario,
      row.instrucciones,
      row.activo,
      row.created_at
    );
  }

  async findByNombre(nombre: string): Promise<Exercise | null> {
    const query = `
      SELECT id, nombre, categoria, contraindicaciones, nivel,
             series_recomendadas, repeticiones_recomendadas, gif_url,
             musculo_principal, musculo_secundario, instrucciones,
             activo, created_at
      FROM exercises 
      WHERE LOWER(nombre) = LOWER($1)
    `;
    
    const result = await this.pool.query(query, [nombre]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Exercise(
      row.id,
      row.nombre,
      row.categoria,
      row.contraindicaciones,
      row.nivel,
      row.series_recomendadas,
      row.repeticiones_recomendadas,
      row.gif_url,
      row.musculo_principal,
      row.musculo_secundario,
      row.instrucciones,
      row.activo,
      row.created_at
    );
  }

  async save(exercise: Omit<Exercise, 'activo' | 'createdAt'>): Promise<Exercise> {
    const query = `
      INSERT INTO exercises (
        id, nombre, categoria, contraindicaciones, nivel,
        series_recomendadas, repeticiones_recomendadas, gif_url,
        musculo_principal, musculo_secundario, instrucciones, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING *
    `;

    const values = [
      exercise.id,
      exercise.nombre,
      exercise.categoria,
      exercise.contraindicaciones,
      exercise.nivel,
      exercise.series_recomendadas,
      exercise.repeticiones_recomendadas,
      exercise.gifUrl,
      exercise.musculo_principal,
      exercise.musculo_secundario,
      exercise.instrucciones
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new Exercise(
      row.id,
      row.nombre,
      row.categoria,
      row.contraindicaciones,
      row.nivel,
      row.series_recomendadas,
      row.repeticiones_recomendadas,
      row.gif_url,
      row.musculo_principal,
      row.musculo_secundario,
      row.instrucciones,
      row.activo,
      row.created_at
    );
  }

  async update(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const fieldMap: Record<string, string> = {
      nombre: 'nombre',
      categoria: 'categoria',
      contraindicaciones: 'contraindicaciones',
      nivel: 'nivel',
      series_recomendadas: 'series_recomendadas',
      repeticiones_recomendadas: 'repeticiones_recomendadas',
      gifUrl: 'gif_url',
      musculo_principal: 'musculo_principal',
      musculo_secundario: 'musculo_secundario',
      instrucciones: 'instrucciones',
      isActive: 'activo'
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && fieldMap[key]) {
        setClause.push(`${fieldMap[key]} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const query = `
      UPDATE exercises 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new Exercise(
      row.id,
      row.nombre,
      row.categoria,
      row.contraindicaciones,
      row.nivel,
      row.series_recomendadas,
      row.repeticiones_recomendadas,
      row.gif_url,
      row.musculo_principal,
      row.musculo_secundario,
      row.instrucciones,
      row.activo,
      row.created_at
    );
  }

  async delete(id: string): Promise<void> {
    const query = 'UPDATE exercises SET activo = false WHERE id = $1';
    await this.pool.query(query, [id]);
  }
}
