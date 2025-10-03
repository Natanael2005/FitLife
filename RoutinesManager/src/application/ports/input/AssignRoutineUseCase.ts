import { UserRoutine } from '../../../domain/entities/UserRoutine';

export interface AssignRoutineUseCase {
  execute(userId: string, routineId: string): Promise<UserRoutine>;
}
