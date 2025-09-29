import { Activity } from "../../../domain/entities/Activity";
import { ActivityType } from "../../../domain/value-objects/ActivityType";

export interface GetHistoryUseCase {
  getHistory(userId: string, filters?: HistoryFilters): Promise<Activity[]>;
}

export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  activityType?: ActivityType;
  limit?: number;
  offset?: number;
}

