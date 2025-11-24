import type { PublicRoutine, UserRoutine } from '../../../domain/entities/Routine.js';

export interface RoutineRepository {
  // PRIVADAS
  createUserRoutine(data: Omit<UserRoutine, 'id'>): Promise<UserRoutine>;
  listUserRoutines(usuarioId: string): Promise<UserRoutine[]>;
  getUserRoutine(id: string): Promise<UserRoutine | null>;
  updateUserRoutine(
    id: string,
    patch: Partial<Omit<UserRoutine, 'id' | 'usuario_id'>>
  ): Promise<UserRoutine | null>;
  deleteUserRoutine(id: string): Promise<void>;

  // PÚBLICAS (lectura)
  listPublicRoutines(): Promise<PublicRoutine[]>;
  getPublicRoutine(id: string): Promise<PublicRoutine | null>;

  // CLON
  clonePublicToUser(
    defaultId: string,
    usuarioId: string,
    overrides?: Partial<Pick<UserRoutine, 'nombre' | 'dias'>>
  ): Promise<UserRoutine>;

  // *** ADMIN ***
  createPublicRoutine(data: Omit<PublicRoutine, 'id'>): Promise<PublicRoutine>;
  updatePublicRoutine(
    id: string,
    patch: Partial<Omit<PublicRoutine, 'id'>>
  ): Promise<PublicRoutine | null>;
  deletePublicRoutine(id: string): Promise<void>;
}
