import { Pool } from 'pg';
import { Food } from '../../../../domain/entities/Food';
import { FoodRepository } from '../../../../application/ports/output/FoodRepository';
import { FoodFilters } from '../../../../application/ports/input/GetFoodsUseCase';

export class PostgresFoodRepository implements FoodRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(filters?: FoodFilters): Promise<Food[]> {
    let query = `
      SELECT id, nombre, categoria, imagen, alergenos,
             calorias, proteinas, activo , created_at
      FROM foods 
      WHERE activo = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.categoria) {
      query += ` AND categoria = $${paramCount++}`;
      params.push(filters.categoria);
    }

    if (filters?.maxCalorias) {
      query += ` AND calorias <= $${paramCount++}`;
      params.push(filters.maxCalorias);
    }

    if (filters?.minProteinas) {
      query += ` AND proteinas >= $${paramCount++}`;
      params.push(filters.minProteinas);
    }

    if (filters?.alergenos && filters.alergenos.length > 0) {
      query += ` AND NOT (alergenos && $${paramCount++})`;
      params.push(filters.alergenos);
    }

    if (filters?.search) {
      query += ` AND (nombre ILIKE $${paramCount++} OR categoria ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY nombre ASC';

    const result = await this.pool.query(query, params);
    
    return result.rows.map(row => new Food(
      row.id,
      row.nombre,
      row.categoria,
      row.imagen,
      row.alergenos,
      parseFloat(row.calorias),
      parseFloat(row.proteinas),
      row.activo,
      row.created_at
    ));
  }

  async findById(id: string): Promise<Food | null> {
    const query = `
      SELECT id, nombre, categoria, imagen, alergenos,
             calorias, proteinas, activo, created_at
      FROM foods 
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Food(
      row.id,
      row.nombre,
      row.categoria,
      row.imagen,
      row.alergenos,
      parseFloat(row.calorias),
      parseFloat(row.proteinas),
      row.activo,
      row.created_at
    );
  }

  async findByNombre(nombre: string): Promise<Food | null> {
    const query = `
      SELECT id, nombre, categoria, imagen, alergenos,
             calorias, proteinas, activo, created_at
      FROM foods 
      WHERE LOWER(nombre) = LOWER($1)
    `;
    
    const result = await this.pool.query(query, [nombre]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Food(
      row.id,
      row.nombre,
      row.categoria,
      row.imagen,
      row.alergenos,
      parseFloat(row.calorias),
      parseFloat(row.proteinas),
      row.activo,
      row.created_at
    );
  }

  async save(food: Omit<Food, 'activo' | 'createdAt'>): Promise<Food> {
    const query = `
      INSERT INTO foods (
        id, nombre, categoria, imagen, alergenos,
        calorias, proteinas, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `;

    const values = [
      food.id,
      food.nombre,
      food.categoria,
      food.imagen,
      food.alergenos,
      food.calorias,
      food.proteinas
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new Food(
      row.id,
      row.nombre,
      row.categoria,
      row.imagen,
      row.alergenos,
      parseFloat(row.calorias),
      parseFloat(row.proteinas),
      row.activo,
      row.created_at
    );
  }

  async update(id: string, updates: Partial<Food>): Promise<Food> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const fieldMap: Record<string, string> = {
      nombre: 'nombre',
      categoria: 'categoria',
      imagen: 'imagen',
      alergenos: 'alergenos',
      calorias: 'calorias',
      proteinas: 'proteinas',
      activo: 'activo'
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
      UPDATE foods 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return new Food(
      row.id,
      row.nombre,
      row.categoria,
      row.imagen,
      row.alergenos,
      parseFloat(row.calorias),
      parseFloat(row.proteinas),
      row.activo,
      row.created_at
    );
  }

  async delete(id: string): Promise<void> {
    const query = 'UPDATE foods SET activo = false WHERE id = $1';
    await this.pool.query(query, [id]);
  }
}
