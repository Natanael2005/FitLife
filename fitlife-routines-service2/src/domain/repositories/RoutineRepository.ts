import { Routine } from '../entities/routine.js';

// Esta interfaz define todos los métodos para interactuar con la base de datos.
export interface IRoutineRepository {
  /**
   * Guarda una nueva rutina de usuario en la base de datos.
   * @param routine La entidad completa de la rutina a guardar.
   * @returns La rutina guardada, incluyendo el ID generado y timestamps.
   */
  save(routine: Routine): Promise<Routine>;

  /**
   * Busca todas las rutinas de un usuario específico.
   * @param usuarioId El ID del usuario.
   * @returns Un array de rutinas.
   */
  findByUserId(usuarioId: string): Promise<Routine[]>;

  /**
   * Busca una rutina específica por su ID, asegurando que pertenezca al usuario.
   * @param id El ID de la rutina.
   * @param usuarioId El ID del usuario propietario.
   * @returns La rutina encontrada o null si no existe.
   */
  findById(id: string, usuarioId: string): Promise<Routine | null>;

  // TODO: Añadir métodos para plantillas públicas y para actualizar/eliminar.
  // findPublicTemplates(): Promise<Routine[]>;
  // findPublicTemplateById(id: string): Promise<Routine | null>;
}