export interface RoutineDetails {
  id: string;
  name: string;
  description: string;
  ejercicios: any[];
  Alimentos: any[];
  isPublic: boolean;
}

export interface RoutineServiceClient {
  getRoutineDetails(routineId: string): Promise<RoutineDetails>;
  getMultipleRoutines(routineIds: string[]): Promise<RoutineDetails[]>;
}
