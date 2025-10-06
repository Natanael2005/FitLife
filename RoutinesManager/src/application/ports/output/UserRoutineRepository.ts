import { UserRoutine } from '../../../domain/entities/UserRoutine';

export interface UserRoutineRepository {
  findByUserId(usuario_id: string): Promise<UserRoutine[]>;
  findByUserAndRoutine(usuario_id: string, rutina_id: string): Promise<UserRoutine | null>;
  save(usuario_id: string, rutina_id: string): Promise<UserRoutine>;
  delete(usuario_id: string, rutina_id: string): Promise<void>;
  updateStatus(id: number, isActive: boolean): Promise<UserRoutine>;
}
