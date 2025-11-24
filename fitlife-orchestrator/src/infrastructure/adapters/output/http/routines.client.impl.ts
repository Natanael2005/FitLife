import { IRoutinesClient } from '../../../../application/ports/output/routines.client.js';
import { Routine, RoutineSnapshot } from '../../../../domain/entities/routine.js';
import { PropagatedError, RoutinesServiceError } from '../../../../domain/entities/errors.js';
import { fetchWithRetry } from '../../../../shared/utils/http.js';
import { env } from '../../../config/env.js';

export class RoutinesClientImpl implements IRoutinesClient {
  // Helper privado para manejar la lógica repetitiva de las llamadas
  private async handleRequest<T>(path: string, options: RequestInit, passThroughErrors = [404, 409]): Promise<T> {
    try {
      const url = `${env.ROUTINES_URL}${path}`;
      const response = await fetchWithRetry(url, options, 'routines');

      // Si el servicio de rutinas devuelve un error de cliente (ej. no encontrado), lo propagamos
      if (!response.ok && passThroughErrors.includes(response.status)) {
        const errorBody = await response.json();
        throw new PropagatedError(response.status, errorBody);
      }

      if (response.status === 204) return undefined as T; // Para respuestas DELETE sin contenido
      return response.json();

    } catch (error) {
      if (error instanceof PropagatedError) throw error; // No envolver un error ya propagado
      throw new RoutinesServiceError();
    }
  }

  createRoutine(snapshot: RoutineSnapshot): Promise<Routine> {
    return this.handleRequest('/rutinas', {
      method: 'POST',
      body: JSON.stringify(snapshot),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  listUserRoutines(usuarioId: string): Promise<Routine[]> {
    return this.handleRequest(`/rutinas?usuarioId=${usuarioId}`, { method: 'GET' });
  }

  getUserRoutine(id: string, usuarioId: string): Promise<Routine> {
      return this.handleRequest(`/rutinas/${id}?usuarioId=${usuarioId}`, { method: 'GET' });
  }

  listPublicRoutines(): Promise<Routine[]> {
      return this.handleRequest('/rutinas-default', { method: 'GET' });
  }

  getPublicRoutine(id: string): Promise<Routine> {
      return this.handleRequest(`/rutinas-default/${id}`, { method: 'GET' });
  }

  cloneFromPublic(defaultId: string, body: { usuario_id: string }): Promise<Routine> {
      return this.handleRequest(`/rutinas/desde-default/${defaultId}`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
      });
  }

  // Por brevedad, dejamos estos sin implementar. Seguirían el mismo patrón.
  patchUserRoutine(id: string, usuarioId: string, patch: Partial<RoutineSnapshot>): Promise<Routine> {
    throw new Error('Method not implemented.');
  }
  deleteUserRoutine(id: string, usuarioId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}