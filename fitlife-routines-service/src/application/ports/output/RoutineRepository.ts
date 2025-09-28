import { Routine } from '../../../domain/entities/Routine.js';
import { RoutineId } from '../../../domain/value-objects/RoutineId.js';
import { UserId } from '../../../domain/value-objects/UserId.js';

export interface RoutineRepository {
  save(routine: Routine): Promise<void>;
  findById(id: RoutineId): Promise<Routine | null>;
  findByUserId(userId: UserId): Promise<Routine[]>;
  update(routine: Routine): Promise<void>;
  delete(id: RoutineId): Promise<void>;
}
