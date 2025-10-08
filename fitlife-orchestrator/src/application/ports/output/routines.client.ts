import { Routine, RoutineSnapshot } from '../../../domain/entities/routine.js';

export interface IRoutinesClient {
  createRoutine(snapshot: RoutineSnapshot): Promise<Routine>;
  cloneFromPublic(defaultId: string, body: { usuario_id: string }): Promise<Routine>;
  listUserRoutines(usuarioId: string): Promise<Routine[]>;
  getUserRoutine(id: string, usuarioId: string): Promise<Routine>;
  patchUserRoutine(id: string, usuarioId: string, patch: Partial<RoutineSnapshot>): Promise<Routine>;
  deleteUserRoutine(id: string, usuarioId: string): Promise<void>;
  listPublicRoutines(): Promise<Routine[]>;
  getPublicRoutine(id: string): Promise<Routine>;
}