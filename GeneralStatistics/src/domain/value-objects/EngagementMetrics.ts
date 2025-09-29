export class EngagementMetrics {
  constructor(
    public readonly dailyActiveUsers: number,
    public readonly weeklyActiveUsers: number,
    public readonly monthlyActiveUsers: number,
    public readonly averageSessionsPerUser: number,
    public readonly retentionRate: number,
    public readonly churnRate: number
  ) {}

  getEngagementScore(): number {
    const dauWeight = 0.3;
    const sessionWeight = 0.3;
    const retentionWeight = 0.4;
    
    return (
      (this.dailyActiveUsers / Math.max(this.monthlyActiveUsers, 1)) * dauWeight +
      Math.min(this.averageSessionsPerUser / 10, 1) * sessionWeight +
      this.retentionRate * retentionWeight
    ) * 100;
  }
}
