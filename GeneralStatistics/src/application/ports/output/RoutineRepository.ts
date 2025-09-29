export interface RoutineRepository {
  getPopularRoutines(limit: number): Promise<any[]>;
}
