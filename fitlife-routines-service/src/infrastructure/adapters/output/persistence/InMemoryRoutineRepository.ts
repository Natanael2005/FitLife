import { randomUUID } from 'node:crypto';
import type { RoutineRepository } from '../../../../application/ports/output/RoutineRepository.js';
import type { PublicRoutine, UserRoutine } from '../../../../domain/entities/Routine.js';

export class InMemoryRoutineRepository implements RoutineRepository {
  private users: Map<string, UserRoutine> = new Map();
  private publics: Map<string, PublicRoutine> = new Map([
    ['tpl-1', {
      id: 'tpl-1',
      nombre: 'Fuerza principiante',
      descripcion: 'Plantilla de fuerza para principiantes',
      dias: ['lunes','miercoles','viernes'],
      ejercicios: [{
        id:'123', nombre:'Sentadillas con salto', categoria:'Piernas',
        contraindicaciones:['LESION_RODILLA','SOBRECARGA_ARTICULAR'],
        impacto:'ALTO', nivel_minimo:'INTERMEDIO',
        series_recomendadas:3, repeticiones_recomendadas:12
      }],
      alimentos: [{
        id:'456', nombre:'Pan integral', categoria:'Desayuno',
        alergenos:['GLUTEN'], calorias_por_100g:250, proteinas:8.5
      }],
      publicada: true,
      version: 1
    }]
  ]);

  async createUserRoutine(data: Omit<UserRoutine,'id'>): Promise<UserRoutine> {
    const id = randomUUID();
    const r: UserRoutine = { id, ...data };
    this.users.set(id, r);
    return r;
  }

  async listUserRoutines(usuarioId: string): Promise<UserRoutine[]> {
    return [...this.users.values()].filter(r => r.usuario_id === usuarioId)
      .sort((a,b) => 0); // simple
  }

  async getUserRoutine(id: string): Promise<UserRoutine | null> {
    return this.users.get(id) ?? null;
  }

  async updateUserRoutine(id: string, patch: Partial<Omit<UserRoutine,'id'|'usuario_id'>>): Promise<UserRoutine | null> {
    const current = this.users.get(id);
    if (!current) return null;
    const updated: UserRoutine = { ...current, ...patch };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUserRoutine(id: string): Promise<void> {
    this.users.delete(id);
  }

  async listPublicRoutines(): Promise<PublicRoutine[]> {
    return [...this.publics.values()].filter(p => p.publicada);
  }

  async getPublicRoutine(id: string): Promise<PublicRoutine | null> {
    return this.publics.get(id) ?? null;
  }

  async clonePublicToUser(defaultId: string, usuarioId: string, overrides?: Partial<Pick<UserRoutine,'nombre'|'dias'>>): Promise<UserRoutine> {
    const tpl = this.publics.get(defaultId);
    if (!tpl) { throw new Error('Plantilla no encontrada'); }
    const id = randomUUID();
    const routine: UserRoutine = {
      id,
      usuario_id: usuarioId,
      nombre: overrides?.nombre ?? tpl.nombre,
      dias: overrides?.dias ?? tpl.dias,
      ejercicios: tpl.ejercicios,
      alimentos: tpl.alimentos
    };
    this.users.set(id, routine);
    return routine;
  }
}
