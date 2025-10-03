import { Item } from '../../../domain/entities/items.js';
import { Routine, RoutineSnapshot } from '../../../domain/entities/routine.js';

export interface GetCreationOptionsResponse {
  usuario_id: string;
  ejercicios: Item[];
  alimentos: Item[];
  // El agrupado es opcional y para conveniencia de la UI
  agrupado_por?: Record<string, { ejercicios: Item[]; alimentos: Item[] }>;
}

export interface IOrchestratorService {
  // Casos de uso principales
  getCreationOptions(usuarioId: string): Promise<GetCreationOptionsResponse>;
  createRoutine(snapshot: RoutineSnapshot): Promise<Routine>;
  cloneFromPublic(defaultId: string, body: { usuario_id: string }): Promise<Routine>;

  // Métodos que actúan como proxy al servicio de Rutinas
  listUserRoutines(usuarioId: string): Promise<Routine[]>;
  getUserRoutine(id: string, usuarioId: string): Promise<Routine>;
  patchUserRoutine(id: string, usuarioId: string, patch: Partial<RoutineSnapshot>): Promise<Routine>;
  deleteUserRoutine(id: string, usuarioId: string): Promise<void>;
  listPublicRoutines(): Promise<Routine[]>;
  getPublicRoutine(id: string): Promise<Routine>;
}