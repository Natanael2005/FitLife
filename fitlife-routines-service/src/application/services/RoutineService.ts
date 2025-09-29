import { z } from 'zod';
import type { RoutineRepository } from '../ports/output/RoutineRepository.js';
import type { CreateRoutineUseCase } from '../ports/input/CreateRoutineUseCase.js';
import type { GetRoutineUseCase } from '../ports/input/GetRoutineUseCase.js';
import type { UpdateRoutineUseCase } from '../ports/input/UpdateRoutineUseCase.js';
import type { DeleteRoutineUseCase } from '../ports/input/DeleteRoutineUseCase.js';
import type { ListUserRoutinesUseCase } from '../ports/input/ListUserRoutinesUseCase.js';
import type { UserRoutine } from '../../domain/entities/Routine.js';
import { InvalidRoutineData } from '../../domain/exceptions/InvalidRoutineData.js';
import { RoutineNotFound } from '../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../domain/exceptions/UnauthorizedAccess.js';

const Days = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'] as const;

const ExerciseSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  categoria: z.string().min(1),
  contraindicaciones: z.array(z.string()),
  impacto: z.enum(['BAJO','MEDIO','ALTO']),
  nivel_minimo: z.enum(['PRINCIPIANTE','INTERMEDIO','AVANZADO']),
  series_recomendadas: z.number().int().nonnegative(),
  repeticiones_recomendadas: z.number().int().positive()
});

const FoodSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  categoria: z.string().min(1),
  alergenos: z.array(z.string()),
  calorias_por_100g: z.number().nonnegative(),
  proteinas: z.number().nonnegative()
});

const UserRoutineSchema = z.object({
  usuario_id: z.string().min(1),
  nombre: z.string().min(1),
  dias: z.array(z.enum(Days)).refine(a => new Set(a).size === a.length, 'dias no debe tener duplicados'),
  ejercicios: z.array(ExerciseSchema),
  alimentos: z.array(FoodSchema)
});

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  return Array.from(new Map(arr.map(x => [x.id, x])).values());
}

export class RoutineService
  implements CreateRoutineUseCase, GetRoutineUseCase, UpdateRoutineUseCase, DeleteRoutineUseCase, ListUserRoutinesUseCase {

  constructor(private repo: RoutineRepository) {}

  async execute(inputOrId: any, usuarioId?: string, patch?: any): Promise<any> {
    // método multipropósito para cumplir interfaces sin duplicar código (simple)
    if (typeof inputOrId === 'string' && usuarioId && patch) {
      return this.update(inputOrId, usuarioId, patch);
    }
    if (typeof inputOrId === 'string' && usuarioId && patch === undefined) {
      return this.get(inputOrId, usuarioId);
    }
    if (typeof inputOrId === 'string' && !usuarioId && patch === undefined) {
      return this.list(inputOrId);
    }
    if (typeof inputOrId === 'object') {
      return this.create(inputOrId);
    }
    throw new Error('Invalid call');
  }

  private async create(input: Omit<UserRoutine,'id'>): Promise<UserRoutine> {
    const parsed = UserRoutineSchema.parse(input);
    const cleaned: Omit<UserRoutine,'id'> = {
      ...parsed,
      ejercicios: dedupeById(parsed.ejercicios),
      alimentos: dedupeById(parsed.alimentos)
    };
    return this.repo.createUserRoutine(cleaned);
  }

  private async get(id: string, usuarioId: string): Promise<UserRoutine> {
    const r = await this.repo.getUserRoutine(id);
    if (!r) throw new RoutineNotFound();
    if (r.usuario_id !== usuarioId) throw new UnauthorizedAccess();
    return r;
  }

  private async update(id: string, usuarioId: string, patch: Partial<Omit<UserRoutine,'id'|'usuario_id'>>): Promise<UserRoutine> {
    const current = await this.repo.getUserRoutine(id);
    if (!current) throw new RoutineNotFound();
    if (current.usuario_id !== usuarioId) throw new UnauthorizedAccess();

    // validación simple de patch
    const merged = {
      ...current,
      ...patch,
      ejercicios: patch.ejercicios ? dedupeById(patch.ejercicios) : current.ejercicios,
      alimentos: patch.alimentos ? dedupeById(patch.alimentos) : current.alimentos
    };
    // validamos shape principal (excepto id)
    UserRoutineSchema.parse({
      usuario_id: merged.usuario_id,
      nombre: merged.nombre,
      dias: merged.dias,
      ejercicios: merged.ejercicios,
      alimentos: merged.alimentos
    });

    const updated = await this.repo.updateUserRoutine(id, patch);
    if (!updated) throw new InvalidRoutineData('No se pudo actualizar');
    return updated;
  }

  async delete(id: string, usuarioId: string): Promise<void> {
    const current = await this.repo.getUserRoutine(id);
    if (!current) return;
    if (current.usuario_id !== usuarioId) throw new UnauthorizedAccess();
    await this.repo.deleteUserRoutine(id);
  }

  private async list(usuarioId: string): Promise<UserRoutine[]> {
    return this.repo.listUserRoutines(usuarioId);
  }

  // auxiliares para públicas
  listPublic() { return this.repo.listPublicRoutines(); }
  getPublic(id: string) { return this.repo.getPublicRoutine(id); }
  cloneFromPublic(defaultId: string, usuarioId: string, overrides?: Partial<Pick<UserRoutine,'nombre'|'dias'>>) {
    return this.repo.clonePublicToUser(defaultId, usuarioId, overrides);
  }
}
