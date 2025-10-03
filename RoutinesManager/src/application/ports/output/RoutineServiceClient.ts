export interface RoutineDetails {
  id: string;
  name: string;
  description: string;
  exercises: any[];
  difficulty: string;
  duration: number;
  isPublic: boolean;
}

export interface RoutineServiceClient {
  getRoutineDetails(routineId: string): Promise<RoutineDetails>;
  getMultipleRoutines(routineIds: string[]): Promise<RoutineDetails[]>;
}
