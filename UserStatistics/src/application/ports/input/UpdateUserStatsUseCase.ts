import { UserStats } from "../../../domain/entities/UserStats";

export interface UpdateUserStatsUseCase {
  execute(userId: string, statsUpdate: Partial<UserStats>): Promise<UserStats>;
}
