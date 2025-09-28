import { Routine } from '../../../domain/entities/Routine.js';

export interface GetRoutineUseCase {
  byId(routineId: string): Promise<Routine>;
  byUser(userId: string): Promise<Routine[]>;
}
