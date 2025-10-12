export interface RoutineDetails {
  id: string;
  nombre: string;
  description: string;
  ejercicios: any[];
  dias: any[];
  alimentos: any[];
  isPublic: boolean;
}

export interface RoutineServiceClient {
  getRoutineDetails(routineId: string): Promise<RoutineDetails>;
  getMultipleRoutines(routineIds: string[]): Promise<RoutineDetails[]>;
}
