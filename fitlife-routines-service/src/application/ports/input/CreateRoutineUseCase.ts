import { Routine } from '../../../domain/entities/Routine.js';

export interface CreateRoutineUseCase {
  execute(payload: {
    userId: string;
    name: string;
    description?: string;
    days?: string; // "lunes", "martes", etc.
    exercises?: Array<{
      exerciseId: string;
      order: number;
      series: number;
      repetitions?: number;
      durationMinutes?: number;
      restSeconds?: number;
    }>;
    foods?: Array<{
      foodId: string;
      quantity: number;
      unit: import('../../../domain/value-objects/FoodPortion.js').UnitType;
      mealTime: string;     // "desayuno" | "almuerzo" | etc.
      schedule?: string;    // "08:00" opcional
    }>;
    isPublic?: boolean;
  }): Promise<Routine>;
}
