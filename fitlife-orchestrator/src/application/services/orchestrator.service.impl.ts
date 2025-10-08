import { IOrchestratorService, GetCreationOptionsResponse } from '../ports/input/orchestrator.service.js';
import { ICaretakerClient } from '../ports/output/caretaker.client.js';
import { IRoutinesClient } from '../ports/output/routines.client.js';
import { Routine, RoutineSnapshot } from '../../domain/entities/routine.js';
import { groupItemsByCategory } from '../../shared/utils/group.js';

export class OrchestratorServiceImpl implements IOrchestratorService {
  // El servicio ahora solo depende de Caretaker y Routines
  constructor(
    private readonly caretakerClient: ICaretakerClient,
    private readonly routinesClient: IRoutinesClient
  ) {}

  async getCreationOptions(
    usuarioId: string
  ): Promise<GetCreationOptionsResponse> {
    const aptos = await this.caretakerClient.fetchAptos(usuarioId);
    const agrupado = groupItemsByCategory(aptos.ejercicios, aptos.alimentos);
    return { ...aptos, agrupado_por: agrupado };
  }

  async createRoutine(snapshot: RoutineSnapshot): Promise<Routine> {
    // Ahora, simplemente llamamos al cliente de rutinas y devolvemos el resultado.
    const nuevaRutina = await this.routinesClient.createRoutine(snapshot);
    return nuevaRutina;
  }

  // --- El resto de los métodos proxy quedan igual ---
  cloneFromPublic(
    defaultId: string,
    body: { usuario_id: string }
  ): Promise<Routine> {
    return this.routinesClient.cloneFromPublic(defaultId, body);
  }

  listUserRoutines(usuarioId: string): Promise<Routine[]> {
    return this.routinesClient.listUserRoutines(usuarioId);
  }

  getUserRoutine(id: string, usuarioId: string): Promise<Routine> {
    return this.routinesClient.getUserRoutine(id, usuarioId);
  }

  patchUserRoutine(
    id: string,
    usuarioId: string,
    patch: Partial<RoutineSnapshot>
  ): Promise<Routine> {
    return this.routinesClient.patchUserRoutine(id, usuarioId, patch);
  }

  deleteUserRoutine(id: string, usuarioId: string): Promise<void> {
    return this.routinesClient.deleteUserRoutine(id, usuarioId);
  }

  listPublicRoutines(): Promise<Routine[]> {
    return this.routinesClient.listPublicRoutines();
  }

  getPublicRoutine(id: string): Promise<Routine> {
    return this.routinesClient.getPublicRoutine(id);
  }
}