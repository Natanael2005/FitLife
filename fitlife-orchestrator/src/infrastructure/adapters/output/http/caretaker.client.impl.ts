import { ICaretakerClient, AptosResponse } from '../../../../application/ports/output/caretaker.client.js';
import { CaretakerServiceError } from '../../../../domain/entities/errors.js';
import { fetchWithRetry } from '../../../../shared/utils/http.js';
import { env } from '../../../config/env.js';

export class CaretakerClientImpl implements ICaretakerClient {
  async fetchAptos(usuarioId: string): Promise<AptosResponse> {
    try {
      const url = `${env.CARETAKER_URL}/aptos`;
      const response = await fetchWithRetry(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: usuarioId }),
        },
        'caretaker' // Nombre para los logs de error
      );
      return response.json();
    } catch (error) {
      // Si fetchWithRetry falla, lo envolvemos en nuestro error de dominio específico
      throw new CaretakerServiceError();
    }
  }
}