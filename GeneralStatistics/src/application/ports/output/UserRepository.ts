import { UserDemographics } from "../../../domain/entities/UserDemographics";

export interface UserRepository {
  getTotalUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getTotalWorkoutCount(): Promise<number>;
  getUserDemographics(): Promise<UserDemographics>;
}
