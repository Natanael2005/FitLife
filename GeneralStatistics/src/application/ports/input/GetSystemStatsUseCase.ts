import { SystemStats } from "../../../domain/entities/SystemStats";

export interface GetSystemStatsUseCase {
  execute(): Promise<SystemStats>;
}
