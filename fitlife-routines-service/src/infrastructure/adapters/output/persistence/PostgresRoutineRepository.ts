// src/infrastructure/adapters/output/persistence/PostgresRoutineRepository.ts
import { Pool } from 'pg';
import { RoutineRepository } from '../../../../application/ports/output/RoutineRepository.js';
import { Routine } from '../../../../domain/entities/Routine.js';
import { RoutineId } from '../../../../domain/value-objects/RoutineId.js';
import { UserId } from '../../../../domain/value-objects/UserId.js';
import { Exercise } from '../../../../domain/entities/Exercise.js';
import { ExerciseSet } from '../../../../domain/value-objects/ExerciseSet.js';
import { Food } from '../../../../domain/entities/Food.js';
import { FoodPortion } from '../../../../domain/value-objects/FoodPortion.js';

type DayOfWeek = import('../../../../domain/entities/Routine.js').DayOfWeek;
type UnitType = import('../../../../domain/value-objects/FoodPortion.js').UnitType;

interface RoutineRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  days: string[] | null;
  exercises: unknown; // JSONB
  foods: unknown;     // JSONB
  is_public: boolean | null;
  is_active: boolean | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
}

interface PersistedExercise {
  exerciseId?: string;
  exercise_id?: string;
  order: number;
  series: number;
  repetitions?: number;
  durationMinutes?: number;
  restSeconds?: number;
}

interface PersistedFood {
  foodId?: string;
  food_id?: string;
  quantity: number;
  unit: UnitType;
  mealTime?: string;
  meal_time?: string;
  schedule?: string;
}

function isPersistedExercise(x: unknown): x is PersistedExercise {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  const hasId = typeof o.exerciseId === 'string' || typeof o.exercise_id === 'string';
  const hasOrder = typeof o.order === 'number';
  const hasSeries = typeof o.series === 'number';
  return hasId && hasOrder && hasSeries;
}

function isPersistedFood(x: unknown): x is PersistedFood {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  const hasId = typeof o.foodId === 'string' || typeof o.food_id === 'string';
  const hasQty = typeof o.quantity === 'number';
  const hasUnit = typeof o.unit === 'string';
  return hasId && hasQty && hasUnit;
}

function parseJsonArray(u: unknown): unknown[] {
  if (Array.isArray(u)) return u;
  if (typeof u === 'string') {
    try { const parsed = JSON.parse(u); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
}

export class PostgresRoutineRepository implements RoutineRepository {
  constructor(private readonly pool: Pool) {}

  async save(routine: Routine): Promise<void> {
    const q = `
      INSERT INTO routines
        (id, user_id, name, description, days, exercises, foods, is_public, is_active, created_at, updated_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `;

    // Usamos getters del dominio (sin any)
    const exercises: unknown[] = routine.getExercises().map(e => e.toJSON());
    const foods: unknown[] = routine.getFoods().map(f => f.toJSON());

    await this.pool.query(q, [
      routine.getId().getValue(),
      routine.getUserId().getValue(),
      routine.getName(),
      routine.getDescription() ?? null,
      routine.getDays(),                 // TEXT[]
      JSON.stringify(exercises),         // JSONB
      JSON.stringify(foods),             // JSONB
      routine.isPublicFlag ?? false,     // nunca NULL
      routine.isActiveFlag ?? true,      // nunca NULL
      routine.getCreatedAt() ?? new Date(),
      routine.getUpdatedAt() ?? new Date()
    ]);
  }

  async findById(id: RoutineId): Promise<Routine | null> {
    const q = `SELECT * FROM routines WHERE id = $1 LIMIT 1`;
    const { rows } = await this.pool.query(q, [id.getValue()]);
    if (rows.length === 0) return null;
    return this.rowToDomain(rows[0] as RoutineRow);
  }

  async findByUserId(userId: UserId): Promise<Routine[]> {
    const q = `SELECT * FROM routines WHERE user_id = $1 ORDER BY created_at DESC`;
    const { rows } = await this.pool.query(q, [userId.getValue()]);
    return rows.map(r => this.rowToDomain(r as RoutineRow));
  }

  async update(routine: Routine): Promise<void> {
    const q = `
      UPDATE routines
      SET name=$2, description=$3, days=$4, exercises=$5, foods=$6,
          is_public=$7, is_active=$8, updated_at=$9
      WHERE id=$1
    `;

    const exercises: unknown[] = routine.getExercises().map(e => e.toJSON());
    const foods: unknown[] = routine.getFoods().map(f => f.toJSON());

    await this.pool.query(q, [
      routine.getId().getValue(),
      routine.getName(),
      routine.getDescription() ?? null,
      routine.getDays(),
      JSON.stringify(exercises),
      JSON.stringify(foods),
      routine.isPublicFlag ?? false,
      routine.isActiveFlag ?? true,
      new Date()
    ]);
  }

  async delete(id: RoutineId): Promise<void> {
    await this.pool.query(`DELETE FROM routines WHERE id = $1`, [id.getValue()]);
  }

  // --- helpers ---

  private rowToDomain(row: RoutineRow): Routine {
    const days: DayOfWeek[] = Array.isArray(row.days) ? (row.days as DayOfWeek[]) : [];

    const rawExercises = parseJsonArray(row.exercises);
    const domainExercises = rawExercises
      .filter(isPersistedExercise)
      .map(e =>
        new Exercise({
          exerciseId: e.exerciseId ?? e.exercise_id ?? '',
          order: e.order,
          sets: new ExerciseSet({
            series: e.series,
            repetitions: typeof e.repetitions === 'number' ? e.repetitions : undefined,
            durationMinutes: typeof e.durationMinutes === 'number' ? e.durationMinutes : undefined,
            restSeconds: typeof e.restSeconds === 'number' ? e.restSeconds : undefined
          })
        })
      );

    const rawFoods = parseJsonArray(row.foods);
    const domainFoods = rawFoods
      .filter(isPersistedFood)
      .map(f =>
        new Food({
          foodId: f.foodId ?? f.food_id ?? '',
          portion: new FoodPortion({
            quantity: f.quantity,
            unit: f.unit,
            mealTime: (f.mealTime ?? f.meal_time) ?? 'desconocido',
            schedule: typeof f.schedule === 'string' ? f.schedule : undefined
          })
        })
      );

    const createdAt = row.created_at ? new Date(row.created_at) : new Date();
    const updatedAt = row.updated_at ? new Date(row.updated_at) : createdAt;

    return new Routine({
      id: new RoutineId(row.id),
      userId: new UserId(row.user_id),
      name: row.name,
      description: row.description ?? undefined,
      days,
      exercises: domainExercises,
      foods: domainFoods,
      isPublic: !!row.is_public,
      isActive: row.is_active === null ? true : !!row.is_active,
      createdAt,
      updatedAt
    });
  }
}
