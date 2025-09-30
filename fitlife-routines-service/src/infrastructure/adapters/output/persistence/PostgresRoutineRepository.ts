import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import type { RoutineRepository } from '../../../../application/ports/output/RoutineRepository.js';
import type { PublicRoutine, UserRoutine } from '../../../../domain/entities/Routine.js';

function mapUserRow(row: any): UserRoutine {
  return {
    id: row.id,
    usuario_id: row.usuario_id,
    nombre: row.nombre,
    dias: row.dias,
    ejercicios: row.ejercicios, // pg ya parsea JSONB -> objeto
    alimentos: row.alimentos
  };
}

function mapPublicRow(row: any): PublicRoutine {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? undefined,
    dias: row.dias,
    ejercicios: row.ejercicios,
    alimentos: row.alimentos,
    publicada: row.publicada,
    version: row.version
  };
}

export class PostgresRoutineRepository implements RoutineRepository {
  private pool: Pool;

  constructor(connString: string) {
    if (!connString) throw new Error('DATABASE_URL is required');
    this.pool = new Pool({ connectionString: connString });
    this.pool.query('select 1').catch(err => {
      console.error('DB connection failed:', err);
    });
  }

  // =============== PRIVADAS ===============

  async createUserRoutine(data: Omit<UserRoutine,'id'>): Promise<UserRoutine> {
    const id = randomUUID();
    const q = `
      INSERT INTO user_routines (id, usuario_id, nombre, dias, ejercicios, alimentos)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await this.pool.query(q, [
      id,
      data.usuario_id,
      data.nombre,
      data.dias,
      JSON.stringify(data.ejercicios), // 👈 stringify JSONB
      JSON.stringify(data.alimentos)    // 👈 stringify JSONB
    ]);
    return mapUserRow(rows[0]);
  }

  async listUserRoutines(usuarioId: string): Promise<UserRoutine[]> {
    const q = `SELECT * FROM user_routines WHERE usuario_id = $1 ORDER BY created_at DESC;`;
    const { rows } = await this.pool.query(q, [usuarioId]);
    return rows.map(mapUserRow);
  }

  async getUserRoutine(id: string): Promise<UserRoutine | null> {
    const { rows } = await this.pool.query(`SELECT * FROM user_routines WHERE id = $1;`, [id]);
    return rows[0] ? mapUserRow(rows[0]) : null;
  }

  async updateUserRoutine(
    id: string,
    patch: Partial<Omit<UserRoutine,'id'|'usuario_id'>>
  ): Promise<UserRoutine | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (patch.nombre !== undefined)      { sets.push(`nombre = $${i++}`);      values.push(patch.nombre); }
    if (patch.dias !== undefined)        { sets.push(`dias = $${i++}`);        values.push(patch.dias); }
    if (patch.ejercicios !== undefined)  { sets.push(`ejercicios = $${i++}`);  values.push(JSON.stringify(patch.ejercicios)); } // 👈
    if (patch.alimentos !== undefined)   { sets.push(`alimentos = $${i++}`);   values.push(JSON.stringify(patch.alimentos)); }  // 👈

    const setClause = sets.length ? sets.join(', ') + ', updated_at = NOW()' : 'updated_at = NOW()';
    const q = `UPDATE user_routines SET ${setClause} WHERE id = $${i} RETURNING *;`;
    values.push(id);

    const { rows } = await this.pool.query(q, values);
    return rows[0] ? mapUserRow(rows[0]) : null;
  }

  async deleteUserRoutine(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM user_routines WHERE id = $1;`, [id]);
  }

  // =============== PÚBLICAS (lectura) ===============

  async listPublicRoutines(): Promise<PublicRoutine[]> {
    const q = `SELECT * FROM public_routines WHERE publicada = TRUE ORDER BY created_at DESC;`;
    const { rows } = await this.pool.query(q);
    return rows.map(mapPublicRow);
  }

  async getPublicRoutine(id: string): Promise<PublicRoutine | null> {
    const { rows } = await this.pool.query(`SELECT * FROM public_routines WHERE id = $1;`, [id]);
    return rows[0] ? mapPublicRow(rows[0]) : null;
  }

  async clonePublicToUser(
    defaultId: string,
    usuarioId: string,
    overrides?: Partial<Pick<UserRoutine,'nombre'|'dias'>>
  ): Promise<UserRoutine> {
    const newId = randomUUID();
    const q = `
      INSERT INTO user_routines (id, usuario_id, nombre, dias, ejercicios, alimentos)
      SELECT
        $1 AS id,
        $2 AS usuario_id,
        COALESCE($3, p.nombre) AS nombre,
        COALESCE($4::text[], p.dias) AS dias,
        p.ejercicios,
        p.alimentos
      FROM public_routines p
      WHERE p.id = $5
      RETURNING *;
    `;
    const params = [
      newId,
      usuarioId,
      overrides?.nombre ?? null,
      overrides?.dias ?? null,
      defaultId
    ];
    const { rows } = await this.pool.query(q, params);
    if (!rows[0]) throw new Error('Plantilla no encontrada');
    return mapUserRow(rows[0]);
  }

  // =============== ADMIN (crud públicas) ===============

  async createPublicRoutine(data: Omit<PublicRoutine,'id'>): Promise<PublicRoutine> {
    const id = randomUUID();
    const q = `
      INSERT INTO public_routines (id, nombre, descripcion, dias, ejercicios, alimentos, publicada, version)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;
    const { rows } = await this.pool.query(q, [
      id,
      data.nombre,
      data.descripcion ?? null,
      data.dias,
      JSON.stringify(data.ejercicios), // 👈 stringify JSONB
      JSON.stringify(data.alimentos),   // 👈 stringify JSONB
      data.publicada,
      data.version
    ]);
    return mapPublicRow(rows[0]);
  }

  async updatePublicRoutine(
    id: string,
    patch: Partial<Omit<PublicRoutine,'id'>>
  ): Promise<PublicRoutine | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (patch.nombre !== undefined)      { sets.push(`nombre = $${i++}`);      values.push(patch.nombre); }
    if (patch.descripcion !== undefined) { sets.push(`descripcion = $${i++}`); values.push(patch.descripcion); }
    if (patch.dias !== undefined)        { sets.push(`dias = $${i++}`);        values.push(patch.dias); }
    if (patch.ejercicios !== undefined)  { sets.push(`ejercicios = $${i++}`);  values.push(JSON.stringify(patch.ejercicios)); } // 👈
    if (patch.alimentos !== undefined)   { sets.push(`alimentos = $${i++}`);   values.push(JSON.stringify(patch.alimentos)); }  // 👈
    if (patch.publicada !== undefined)   { sets.push(`publicada = $${i++}`);   values.push(patch.publicada); }
    if (patch.version !== undefined)     { sets.push(`version = $${i++}`);     values.push(patch.version); }

    const setClause = sets.length ? sets.join(', ') + ', updated_at = NOW()' : 'updated_at = NOW()';
    const q = `UPDATE public_routines SET ${setClause} WHERE id = $${i} RETURNING *;`;
    values.push(id);

    const { rows } = await this.pool.query(q, values);
    return rows[0] ? mapPublicRow(rows[0]) : null;
  }

  async deletePublicRoutine(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM public_routines WHERE id = $1;`, [id]);
  }
}
