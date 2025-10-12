import { z } from 'zod';
import type { RoutineRepository } from '../ports/output/RoutineRepository.js';
import type { PublicRoutine, UserRoutine } from '../../domain/entities/Routine.js';
import { RoutineNotFound } from '../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../domain/exceptions/UnauthorizedAccess.js';
import { InvalidRoutineData } from '../../domain/exceptions/InvalidRoutineData.js';

const Days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'] as const;

const ExerciseSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  categoria: z.string().min(1),
  contraindicaciones: z.array(z.string()),
  // nivel: z.enum(['BAJO', 'INTERMEDIO', 'AVANZADO']),
  nivel: z.array(z.string()), // Temporalmente deshabilitado el enum para permitir niveles personalizados
  series_recomendadas: z.number().int().nonnegative(),
  repeticiones_recomendadas: z.number().int().positive(),
  gif_url: z.string(),
  musculo_principal: z.string(),
  musculo_secundario: z.string(),
  instrucciones: z.array(z.string()).optional(),
  isActive: z.boolean().optional()

});

const FoodSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  categoria: z.string().min(1),
  imagen: z.string().optional(),
  alergenos: z.array(z.string()),
  calorias: z.number().nonnegative(),
  proteinas: z.number().nonnegative(),
  isActive: z.boolean().optional()
});

const UserRoutineSchema = z.object({
  usuario_id: z.string().min(1),
  nombre: z.string().min(1),
  dias: z.array(z.enum(Days)).refine(a => new Set(a).size === a.length, 'dias no debe tener duplicados'),
  ejercicios: z.array(ExerciseSchema),
  alimentos: z.array(FoodSchema)
});

const PublicRoutineCreateSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  dias: z.array(z.enum(Days)).refine(a => new Set(a).size === a.length, 'dias no debe tener duplicados'),
  ejercicios: z.array(ExerciseSchema),
  alimentos: z.array(FoodSchema),
  publicada: z.boolean().optional(), // default true
  version: z.number().int().positive().optional() // default 1
});

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  return Array.from(new Map(arr.map(x => [x.id, x])).values());
}

export class RoutineService {
  constructor(private repo: RoutineRepository) { }

  // =============== PRIVADAS ===============

  async createUserRoutine(input: Omit<UserRoutine, 'id'>): Promise<UserRoutine> {
    const parsed = UserRoutineSchema.parse(input);
    return this.repo.createUserRoutine({
      ...parsed,
      ejercicios: dedupeById(parsed.ejercicios),
      alimentos: dedupeById(parsed.alimentos)
    });
  }

  async listUserRoutines(usuarioId: string): Promise<UserRoutine[]> {
    if (!usuarioId) throw new InvalidRoutineData('usuarioId requerido');
    return this.repo.listUserRoutines(usuarioId);
  }

  async getUserRoutine(id: string, usuarioId: string): Promise<UserRoutine> {
    const r = await this.repo.getUserRoutine(id);
    if (!r) throw new RoutineNotFound();
    if (r.usuario_id !== usuarioId) throw new UnauthorizedAccess();
    return r;
  }

  async updateUserRoutine(
    id: string,
    usuarioId: string,
    patch: Partial<Omit<UserRoutine, 'id' | 'usuario_id'>>
  ): Promise<UserRoutine> {
    const current = await this.repo.getUserRoutine(id);
    if (!current) throw new RoutineNotFound();
    if (current.usuario_id !== usuarioId) throw new UnauthorizedAccess();

    // Normalizamos el patch (dedupe si vienen arrays)
    const cleanedPatch: Partial<Omit<UserRoutine, 'id' | 'usuario_id'>> = {
      ...patch,
      ejercicios: patch.ejercicios ? dedupeById(patch.ejercicios) : undefined,
      alimentos: patch.alimentos ? dedupeById(patch.alimentos) : undefined
    };

    // Fallbacks explícitos a los valores actuales para evitar undefined en validación
    const merged: UserRoutine = {
      ...current,
      ...cleanedPatch,
      dias: cleanedPatch.dias ?? current.dias ?? [],
      ejercicios: cleanedPatch.ejercicios ?? current.ejercicios ?? [],
      alimentos: cleanedPatch.alimentos ?? current.alimentos ?? []
    };

    // Validamos el shape final
    UserRoutineSchema.parse({
      usuario_id: merged.usuario_id,
      nombre: merged.nombre,
      dias: merged.dias,
      ejercicios: merged.ejercicios,
      alimentos: merged.alimentos
    });

    // Importante: pasar al repo SOLO los campos del patch limpio
    const updated = await this.repo.updateUserRoutine(id, {
      nombre: cleanedPatch.nombre,
      dias: cleanedPatch.dias,
      ejercicios: cleanedPatch.ejercicios,
      alimentos: cleanedPatch.alimentos
    });
    if (!updated) throw new InvalidRoutineData('No se pudo actualizar');
    return updated;
  }


  async deleteUserRoutine(id: string, usuarioId: string): Promise<void> {
    const current = await this.repo.getUserRoutine(id);
    if (!current) return;
    if (current.usuario_id !== usuarioId) throw new UnauthorizedAccess();
    await this.repo.deleteUserRoutine(id);
  }

  // =============== PÚBLICAS (lectura y clon) ===============

  listPublic(): Promise<PublicRoutine[]> {
    return this.repo.listPublicRoutines();
  }

  getPublic(id: string): Promise<PublicRoutine | null> {
    return this.repo.getPublicRoutine(id);
  }

  cloneFromPublic(defaultId: string, usuarioId: string, overrides?: Partial<Pick<UserRoutine, 'nombre' | 'dias'>>) {
    if (!usuarioId) throw new InvalidRoutineData('usuario_id requerido');
    return this.repo.clonePublicToUser(defaultId, usuarioId, overrides);
  }

  // =============== ADMIN (crear/editar/eliminar públicas) ===============

  async createPublic(input: z.infer<typeof PublicRoutineCreateSchema>): Promise<PublicRoutine> {
    const parsed = PublicRoutineCreateSchema.parse(input);
    return this.repo.createPublicRoutine({
      ...parsed,
      publicada: parsed.publicada ?? true,
      version: parsed.version ?? 1,
      ejercicios: dedupeById(parsed.ejercicios),
      alimentos: dedupeById(parsed.alimentos)
    });
  }

  async updatePublic(id: string, patch: Partial<z.infer<typeof PublicRoutineCreateSchema>>): Promise<PublicRoutine | null> {
    const cleaned = {
      ...patch,
      ejercicios: patch.ejercicios ? dedupeById(patch.ejercicios) : undefined,
      alimentos: patch.alimentos ? dedupeById(patch.alimentos) : undefined
    };

    if (cleaned.nombre !== undefined && !cleaned.nombre) {
      throw new InvalidRoutineData('nombre no puede ser vacío');
    }
    if (cleaned.dias) {
      const okDays = cleaned.dias.every(d => (Days as readonly string[]).includes(d));
      const noDup = new Set(cleaned.dias).size === cleaned.dias.length;
      if (!okDays || !noDup) throw new InvalidRoutineData('dias inválidos o duplicados');
    }

    return this.repo.updatePublicRoutine(id, cleaned);
  }

  async deletePublic(id: string): Promise<void> {
    await this.repo.deletePublicRoutine(id);
  }
}
