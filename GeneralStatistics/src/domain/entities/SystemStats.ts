import { EngagementMetrics } from "../value-objects/EngagementMetrics";
import { PopularRoutine } from "./PopularRoutine";
import { UserDemographics } from "./UserDemographics";

export class SystemStats {
  constructor(
    public readonly id: number,
    public readonly totalUsers: number,
    public readonly activeUsers: number,
    public readonly totalWorkouts: number,
    public readonly totalCaloriesBurned: number,
    public readonly averageSessionTime: number,
    public readonly popularRoutines: PopularRoutine[],
    public readonly userDemographics: UserDemographics,
    public readonly engagementMetrics: EngagementMetrics,
    public readonly timestamp: Date,
    public readonly createdAt: Date
  ) {}

  getActiveUserPercentage(): number {
    return this.totalUsers > 0 ? (this.activeUsers / this.totalUsers) * 100 : 0;
  }

  getUserGrowthRate(): number {
    return 15.5; 
  }
}
