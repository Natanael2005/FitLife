import { UserStats } from '../../../domain/entities/UserStats'; 

export interface UserStatsRepository {
  findByUserId(userId: string): Promise<UserStats | null>;
  save(userStats: Omit<UserStats, 'id' | 'createdAt'>): Promise<UserStats>;
  update(userId: string, updates: Partial<UserStats>): Promise<UserStats>;
  delete(userId: string): Promise<void>;
}

