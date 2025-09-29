// UpdateRoutineUseCase.ts
import type { UserRoutine } from '../../../domain/entities/Routine.js';
export interface UpdateRoutineUseCase {
  execute(id: string, usuarioId: string, patch: Partial<Omit<UserRoutine, 'id' | 'usuario_id'>>): Promise<UserRoutine>;
}
