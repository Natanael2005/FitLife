import { UserRoutine } from '../../../domain/entities/UserRoutine';

export interface GetUserRoutinesUseCase {
  execute(userId: string): Promise<UserRoutine[]>;
}
