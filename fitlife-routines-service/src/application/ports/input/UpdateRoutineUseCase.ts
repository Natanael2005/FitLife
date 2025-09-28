import { Routine } from '../../../domain/entities/Routine.js';

export interface UpdateRoutineUseCase {
  execute(payload: {
    routineId: string;
    userId: string; // ownership básico (luego podrás sacar del token)
    name?: string;
    description?: string;
    days?: string[];
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
      mealTime: string;
      schedule?: string;
    }>;
    isPublic?: boolean;
    isActive?: boolean;
  }): Promise<Routine>;
}
