import { UserStats } from './../../../domain/entities/UserStats';
export interface GetUserStatsUseCase {
  execute(userId: string): Promise<UserStats>;
}
