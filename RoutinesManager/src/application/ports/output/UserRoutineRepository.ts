import { UserRoutine } from '../../../domain/entities/UserRoutine';

export interface UserRoutineRepository {
  findByUserId(userId: string): Promise<UserRoutine[]>;
  findByUserAndRoutine(userId: string, routineId: string): Promise<UserRoutine | null>;
  save(userId: string, routineId: string): Promise<UserRoutine>;
  delete(userId: string, routineId: string): Promise<void>;
  updateStatus(id: number, isActive: boolean): Promise<UserRoutine>;
}
