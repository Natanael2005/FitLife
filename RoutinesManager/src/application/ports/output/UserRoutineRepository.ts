import { UserRoutine } from '../../../domain/entities/UserRoutine';

export interface UserRoutineRepository {
  findByUserId(usuario_id: string): Promise<UserRoutine[]>;
  findById(id: string): Promise<UserRoutine | null>;
  findByUserAndRoutine(usuario_id: string, rutina_id: string): Promise<UserRoutine | null>;
  save(userRoutine: Partial<UserRoutine>): Promise<UserRoutine>;
  update(id: string, userRoutine: Partial<UserRoutine>): Promise<UserRoutine>;
  delete(id: string): Promise<void>;
}
