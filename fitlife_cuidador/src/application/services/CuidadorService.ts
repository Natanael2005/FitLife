import { UserHealthQueryPort } from '../ports/output/UserHealthQueryPort';
import {
  CatalogQueryPort,
  CatalogExercise,
  CatalogFood,
  CatalogRoutine,
  Nivel,
} from '../ports/output/CatalogQueryPort';
import { normalizeToken } from '../../domain/value-objects/health';

type DenyReason = 'CONTRAINDICACION' | 'NIVEL_REQUERIDO' | 'ALERGENO';

const NivelRank: Record<Nivel, number> = {
  BAJO: 1,
  INTERMEDIO: 2,
  AVANZADO: 3,
};

export class CuidadorService {
  constructor(
    private readonly healthPort: UserHealthQueryPort,
    private readonly catalogPort?: CatalogQueryPort
  ) {}

  // ---- Reglas internas ----
  private exerciseIsAllowed(
    e: CatalogExercise,
    ctx: Awaited<ReturnType<UserHealthQueryPort['getHealthContext']>>
  ) {
    // 1) Contraindicaciones (intersección)
    const eContras = (e.contraindicaciones ?? []).map(normalizeToken);
    for (const c of eContras) {
      if (ctx.conditions.has(c)) {
        return { ok: false as const, reason: 'CONTRAINDICACION' as const };
      }
    }
    // 2) Nivel requerido del ejercicio vs nivel del usuario
    if (NivelRank[e.nivel] > NivelRank[ctx.nivel as Nivel]) {
      return { ok: false as const, reason: 'NIVEL_REQUERIDO' as const };
    }
    return { ok: true as const };
  }

  private foodIsAllowed(
    f: CatalogFood,
    ctx: Awaited<ReturnType<UserHealthQueryPort['getHealthContext']>>
  ) {
    const fAlergenos = (f.alergenos ?? []).map(normalizeToken);
    for (const a of fAlergenos) {
      if (ctx.allergies.has(a)) {
        return { ok: false as const, reason: 'ALERGENO' as const };
      }
    }
    return { ok: true as const };
  }

  // ---- POST de prueba (filtran arrays explícitos) ----
  async filterExercises(
    userId: string,
    ejercicios: CatalogExercise[]
  ): Promise<{ permitidos: CatalogExercise[]; bloqueados: Array<{ item: CatalogExercise; motivo: DenyReason }> }> {
    const ctx = await this.healthPort.getHealthContext(userId);
    const permitidos: CatalogExercise[] = [];
    const bloqueados: Array<{ item: CatalogExercise; motivo: DenyReason }> = [];

    for (const e of ejercicios) {
      const r = this.exerciseIsAllowed(e, ctx);
      if (r.ok) permitidos.push(e);
      else bloqueados.push({ item: e, motivo: r.reason });
    }
    return { permitidos, bloqueados };
  }

  async filterFoods(
    userId: string,
    alimentos: CatalogFood[]
  ): Promise<{ permitidos: CatalogFood[]; bloqueados: Array<{ item: CatalogFood; motivo: DenyReason }> }> {
    const ctx = await this.healthPort.getHealthContext(userId);
    const permitidos: CatalogFood[] = [];
    const bloqueados: Array<{ item: CatalogFood; motivo: DenyReason }> = [];

    for (const f of alimentos) {
      const r = this.foodIsAllowed(f, ctx);
      if (r.ok) permitidos.push(f);
      else bloqueados.push({ item: f, motivo: r.reason });
    }
    return { permitidos, bloqueados };
  }

  async filterBoth(
    userId: string,
    payload: { ejercicios: CatalogExercise[]; alimentos: CatalogFood[] }
  ) {
    const [ex, fo] = await Promise.all([
      this.filterExercises(userId, payload.ejercicios),
      this.filterFoods(userId, payload.alimentos),
    ]);
    return { ejercicios: ex, alimentos: fo };
  }

  async filterRoutines(
    userId: string,
    rutinas: CatalogRoutine[]
  ): Promise<{ aceptadas: CatalogRoutine[]; descartadas: Array<{ item: CatalogRoutine; motivo: DenyReason }> }> {
    const ctx = await this.healthPort.getHealthContext(userId);
    const aceptadas: CatalogRoutine[] = [];
    const descartadas: Array<{ item: CatalogRoutine; motivo: DenyReason }> = [];

    for (const r of rutinas) {
      let rejected: DenyReason | null = null;

      for (const e of r.ejercicios) {
        const er = this.exerciseIsAllowed(e, ctx);
        if (!er.ok) { rejected = er.reason; break; }
      }
      if (!rejected) {
        for (const f of r.alimentos) {
          const fr = this.foodIsAllowed(f, ctx);
          if (!fr.ok) { rejected = fr.reason; break; }
        }
      }
      if (rejected) descartadas.push({ item: r, motivo: rejected });
      else aceptadas.push(r);
    }
    return { aceptadas, descartadas };
  }

  // ---- GET automáticos (catálogo + filtro interno) ----
  async getAllowedExercises(userId: string) {
    if (!this.catalogPort) throw new Error('Catalog port not configured');
    const [ctx, all] = await Promise.all([
      this.healthPort.getHealthContext(userId),
      this.catalogPort.getAllExercises(),
    ]);
    return all.filter(e => this.exerciseIsAllowed(e, ctx).ok);
  }

  async getAllowedFoods(userId: string) {
    if (!this.catalogPort) throw new Error('Catalog port not configured');
    const [ctx, all] = await Promise.all([
      this.healthPort.getHealthContext(userId),
      this.catalogPort.getAllFoods(),
    ]);
    return all.filter(f => this.foodIsAllowed(f, ctx).ok);
  }

  /** STRICT: descarta rutina completa si un solo elemento no es apto */
  async getAllowedRoutines(userId: string) {
    if (!this.catalogPort) throw new Error('Catalog port not configured');
    const all = await this.catalogPort.getAllPublicRoutinesExpanded();
    const { aceptadas } = await this.filterRoutines(userId, all);
    return aceptadas;
  }

  async getAllowedForBuilder(userId: string) {
    const [ejercicios, alimentos] = await Promise.all([
      this.getAllowedExercises(userId),
      this.getAllowedFoods(userId),
    ]);
    return { ejercicios, alimentos };
  }
}
