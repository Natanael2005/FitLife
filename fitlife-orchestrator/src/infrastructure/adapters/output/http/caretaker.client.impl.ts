import { ICaretakerClient, AptosResponse } from '../../../../application/ports/output/caretaker.client.js';
import { CaretakerServiceError } from '../../../../domain/entities/errors.js';
import { fetchWithRetry } from '../../../../shared/utils/http.js';
import { env } from '../../../config/env.js';

export class CaretakerClientImpl implements ICaretakerClient {
  async fetchAptos(usuarioId: string): Promise<AptosResponse> {
    try {
      // CAMBIO: Construimos la URL con el query param, como sugeriste.
      const url = `${env.CARETAKER_URL}/api/cuidador/ejercicios-aptos?userId=${usuarioId}`;
      
      // CAMBIO: La petición ahora es un GET simple.
      const response = await fetchWithRetry(
        url,
        { method: 'GET' },
        'caretaker'
      );
      return response.json();
    } catch (error) {
      throw new CaretakerServiceError();
    }
  }
}