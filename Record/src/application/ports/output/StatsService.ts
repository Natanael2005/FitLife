export interface StatsService {
  updateUserStats(userId: string, statsUpdate: any): Promise<void>;
}
