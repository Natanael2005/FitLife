// ListUserRoutinesUseCase.ts
import type { UserRoutine } from '../../../domain/entities/Routine.js';
export interface ListUserRoutinesUseCase {
  execute(usuarioId: string): Promise<UserRoutine[]>;
}
