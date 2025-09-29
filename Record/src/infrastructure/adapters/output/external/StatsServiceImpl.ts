import axios from 'axios';
import { StatsService } from '../../../../application/ports/output/StatsService';

export class StatsServiceImpl implements StatsService {
  constructor(private readonly statsServiceUrl: string) {}

  async updateUserStats(userId: string, statsUpdate: any): Promise<void> {
    try {
      await axios.post(`${this.statsServiceUrl}/api/stats/user/${userId}/update`, statsUpdate);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }
}
