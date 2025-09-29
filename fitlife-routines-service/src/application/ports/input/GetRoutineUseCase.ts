// GetRoutineUseCase.ts
import type { UserRoutine } from '../../../domain/entities/Routine.js';
export interface GetRoutineUseCase {
  execute(id: string, usuarioId: string): Promise<UserRoutine>;
}
