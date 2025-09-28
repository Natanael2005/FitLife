// src/application/services/RoutineService.ts
import { Routine } from '../../domain/entities/Routine.js';
import { Exercise } from '../../domain/entities/Exercise.js';
import { Food } from '../../domain/entities/Food.js';
import { ExerciseSet } from '../../domain/value-objects/ExerciseSet.js';
import { FoodPortion } from '../../domain/value-objects/FoodPortion.js';
import { RoutineId } from '../../domain/value-objects/RoutineId.js';
import { UserId } from '../../domain/value-objects/UserId.js';

import { RoutineNotFound } from '../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../domain/exceptions/UnauthorizedAccess.js';

import { RoutineRepository } from '../ports/output/RoutineRepository.js';
import { Logger } from '../../shared/utils/Logger.js';

type DayOfWeek = import('../../domain/entities/Routine.js').DayOfWeek;

const VALID_DAYS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'] as const;

function toDayOfWeekArray(days?: string[] | null): DayOfWeek[] {
  if (!Array.isArray(days)) return [];
  const uniq = Array.from(new Set(days));
  return uniq.filter((d): d is DayOfWeek => (VALID_DAYS as readonly string[]).includes(d));
}

export class RoutineService {
  private readonly repo: RoutineRepository;
  private readonly log = new Logger('RoutineService');

  constructor(repo: RoutineRepository) {
    this.repo = repo;
  }

  // CREATE
  async create(params: {
    userId: string;
    name: string;
    description?: string;
    days?: string[];
    exercises?: Array<{ exerciseId: string; order: number; series: number; repetitions?: number; durationMinutes?: number; restSeconds?: number; }>;
    foods?: Array<{ foodId: string; quantity: number; unit: import('../../domain/value-objects/FoodPortion.js').UnitType; mealTime: string; schedule?: string; }>;
    isPublic?: boolean;
  }): Promise<Routine> {
    const exercises = (params.exercises ?? []).map(e =>
      new Exercise({
        exerciseId: e.exerciseId,
        order: e.order,
        sets: new ExerciseSet({
          series: e.series,
          repetitions: e.repetitions,
          durationMinutes: e.durationMinutes,
          restSeconds: e.restSeconds
        })
      })
    );

    const foods = (params.foods ?? []).map(f =>
      new Food({
        foodId: f.foodId,
        portion: new FoodPortion({
          quantity: f.quantity,
          unit: f.unit,
          mealTime: f.mealTime,
          schedule: f.schedule
        })
      })
    );

    const routine = new Routine({
      userId: new UserId(params.userId),
      name: params.name,
      description: params.description,
      days: toDayOfWeekArray(params.days),
      exercises,
      foods,
      isPublic: params.isPublic ?? false
    });

    await this.repo.save(routine);
    this.log.info('Routine created', { routineId: routine.getId().getValue(), userId: params.userId });
    return routine;
  }

  // READ
  async getById(routineId: string): Promise<Routine> {
    const routine = await this.repo.findById(new RoutineId(routineId));
    if (!routine) throw new RoutineNotFound(routineId);
    return routine;
  }

  async getByUser(userId: string): Promise<Routine[]> {
    return this.repo.findByUserId(new UserId(userId));
  }

  // UPDATE (inmutable, sin any)
  async update(params: {
    routineId: string; userId: string;
    name?: string; description?: string; days?: string[];
    exercises?: Array<{ exerciseId: string; order: number; series: number; repetitions?: number; durationMinutes?: number; restSeconds?: number; }>;
    foods?: Array<{ foodId: string; quantity: number; unit: import('../../domain/value-objects/FoodPortion.js').UnitType; mealTime: string; schedule?: string; }>;
    isPublic?: boolean; isActive?: boolean;
  }): Promise<Routine> {
    const id = new RoutineId(params.routineId);
    const existing = await this.repo.findById(id);
    if (!existing) throw new RoutineNotFound(params.routineId);

    if (existing.getUserId().getValue() !== params.userId) {
      throw new UnauthorizedAccess();
    }

    const nextName = typeof params.name === 'string' ? params.name : existing.getName();
    const nextDescription = typeof params.description === 'undefined' ? existing.getDescription() : params.description;
    const nextDays = Array.isArray(params.days) ? toDayOfWeekArray(params.days) : existing.getDays();

    const nextExercises = params.exercises
      ? params.exercises.map(e =>
          new Exercise({
            exerciseId: e.exerciseId,
            order: e.order,
            sets: new ExerciseSet({
              series: e.series,
              repetitions: e.repetitions,
              durationMinutes: e.durationMinutes,
              restSeconds: e.restSeconds
            })
          })
        )
      : existing.getExercises();

    const nextFoods = params.foods
      ? params.foods.map(f =>
          new Food({
            foodId: f.foodId,
            portion: new FoodPortion({
              quantity: f.quantity,
              unit: f.unit,
              mealTime: f.mealTime,
              schedule: f.schedule
            })
          })
        )
      : existing.getFoods();

    const nextIsPublic = typeof params.isPublic === 'boolean' ? params.isPublic : existing.isPublicFlag;
    const nextIsActive = typeof params.isActive === 'boolean' ? params.isActive : existing.isActiveFlag;

    const updated = new Routine({
      id: existing.getId(),
      userId: existing.getUserId(),
      name: nextName,
      description: nextDescription,
      days: nextDays,
      exercises: nextExercises,
      foods: nextFoods,
      isPublic: nextIsPublic,
      isActive: nextIsActive,
      createdAt: existing.getCreatedAt(),
      updatedAt: new Date()
    });

    await this.repo.update(updated);
    this.log.info('Routine updated', { routineId: params.routineId });
    return updated;
  }

  // DELETE
  async delete(params: { routineId: string; userId: string }): Promise<void> {
    const id = new RoutineId(params.routineId);
    const existing = await this.repo.findById(id);
    if (!existing) return; // idempotente
    if (existing.getUserId().getValue() !== params.userId) throw new UnauthorizedAccess();
    await this.repo.delete(id);
    this.log.info('Routine deleted', { routineId: params.routineId });
  }
}
