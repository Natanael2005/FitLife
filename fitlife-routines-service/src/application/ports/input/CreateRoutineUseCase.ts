// CreateRoutineUseCase.ts
import type { UserRoutine } from '../../../domain/entities/Routine.js';
export interface CreateRoutineUseCase {
  execute(input: Omit<UserRoutine, 'id'>): Promise<UserRoutine>;
}
