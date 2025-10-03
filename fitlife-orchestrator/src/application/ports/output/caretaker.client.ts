import { Item } from '../../../domain/entities/items.js';

export interface AptosResponse {
  usuario_id: string;
  ejercicios: Item[];
  alimentos: Item[];
}

export interface ICaretakerClient {
  fetchAptos(usuarioId: string): Promise<AptosResponse>;
}