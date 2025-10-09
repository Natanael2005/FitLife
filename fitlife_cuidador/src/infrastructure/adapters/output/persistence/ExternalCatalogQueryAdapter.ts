import { DataSource } from 'typeorm';
import { CatalogQueryPort } from '../../../../application/ports/output/CatalogQueryPort';
import { getDataSource } from '../../../config/datasource';
import {
  SQL_GET_ALL_EXERCISES,
  SQL_GET_ALL_FOODS,
  SQL_GET_ALL_PUBLIC_ROUTINES_EXPANDED
} from '../../../config/catalog-queries';

type Nivel = 'BAJO' | 'INTERMEDIO' | 'AVANZADO';

// -------- Helpers tipados (evitan 'never') --------
const asStr = (v: unknown): string =>
  v === null || v === undefined ? '' : String(v);

const normalizeToken = (s: unknown): string =>
  asStr(s).trim().replace(/\s+/g, '_').toUpperCase();

const toTokenArray = (v: unknown): string[] => {
  if (Array.isArray(v)) {
    return (v as unknown[]).map(normalizeToken).filter((t): t is string => t.length > 0);
  }
  const str = asStr(v).trim();
  if (!str) return [];
  if (str.startsWith('[')) { // JSON array
    try {
      const arr = JSON.parse(str) as unknown[];
      if (Array.isArray(arr)) {
        return arr.map(normalizeToken).filter((t): t is string => t.length > 0);
      }
    } catch { /* ignore */ }
  }
  return str.split(',').map(normalizeToken).filter((t): t is string => t.length > 0);
};

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return (v as unknown[]).map(asStr);
  const str = asStr(v).trim();
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str) as unknown[];
      if (Array.isArray(arr)) return arr.map(asStr);
    } catch { /* ignore */ }
  }
  return [str];
};

const mapNivel = (raw: unknown): Nivel => {
  const n = asStr(raw).trim().toUpperCase();
  if (n === 'AVANZADO' || n === 'ALTO') return 'AVANZADO';
  if (n === 'INTERMEDIO' || n === 'MEDIO') return 'INTERMEDIO';
  return 'BAJO'; // PRINCIPIANTE/BAJO/empty
};

export class ExternalCatalogQueryAdapter implements CatalogQueryPort {
  private ds!: DataSource;

  constructor(ds?: DataSource) {
    if (ds) this.ds = ds;
  }

  private async ensureDS() {
    if (!this.ds) this.ds = await getDataSource();
    if (!this.ds.isInitialized) await this.ds.initialize();
  }

  async getAllExercises() {
    await this.ensureDS();
    const rows = await this.ds.query(SQL_GET_ALL_EXERCISES);
    return rows.map((r: any) => ({
      id: String(r.id),
      nombre: r.nombre,
      categoria: r.categoria ?? null,
      contraindicaciones: toTokenArray(r.contraindicaciones),
      nivel: mapNivel(r.nivel),
      series_recomendadas: r.series_recomendadas ?? null,
      repeticiones_recomendadas: r.repeticiones_recomendadas ?? null,
      gifUrl: r.gif_url ?? '',
      musculo_principal: r.musculo_principal ?? null,
      musculo_secundario: r.musculo_secundario ?? null,
      instrucciones: toStringArray(r.instrucciones),
      isActive: Boolean(r.activo),
    }));
  }

  async getAllFoods() {
    await this.ensureDS();
    const rows = await this.ds.query(SQL_GET_ALL_FOODS);
    return rows.map((r: any) => ({
      id: String(r.id),
      nombre: r.nombre,
      categoria: r.categoria ?? null,
      alergenos: toTokenArray(r.alergenos),
      imagen: r.imagen ?? '',
      calorias: r.calorias,
      proteinas: r.proteinas,
      isActive: Boolean(r.activo),
    }));
  }

  async getAllPublicRoutinesExpanded() {
    await this.ensureDS();

    const routinesSQL = (SQL_GET_ALL_PUBLIC_ROUTINES_EXPANDED ?? '').trim();
    if (!routinesSQL.length) return [];

    const rows = await this.ds.query(routinesSQL);

    const toDias = (v: unknown): string[] => {
      if (Array.isArray(v)) return (v as unknown[]).map(asStr);
      return [];
    };

    const asArray = (v: unknown): any[] => {
      if (Array.isArray(v)) return v as any[];
      // algunos drivers devuelven JSONB como string
      const s = asStr(v);
      if (s.startsWith('[')) {
        try { const j = JSON.parse(s); if (Array.isArray(j)) return j; } catch {}
      }
      return [];
    };

    return rows.map((r: any) => {
      const ejercicios = asArray(r.ejercicios_json).map((e: any) => ({
        id: asStr(e.id),
        nombre: e.nombre,
        categoria: e.categoria ?? null,
        contraindicaciones: toTokenArray(e.contraindicaciones),
        nivel: mapNivel(e.nivel),
        series_recomendadas: e.series_recomendadas ?? null,
        repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
        gifUrl: e.gif_url ?? '',
        musculo_principal: e.musculo_principal ?? null,
        musculo_secundario: e.musculo_secundario ?? null,
        instrucciones: toStringArray(e.instrucciones),
        // las rutinas publicadas normalmente contienen ítems activos
        isActive: e.activo != null ? Boolean(e.activo) : true,
      }));

      const alimentos = asArray(r.alimentos_json).map((f: any) => ({
        id: asStr(f.id),
        nombre: f.nombre,
        categoria: f.categoria ?? null,
        alergenos: toTokenArray(f.alergenos),
        imagen: f.imagen ?? '',
        calorias: f.calorias ?? null,
        proteinas: f.proteinas ?? null,
        isActive: f.activo != null ? Boolean(f.activo) : true,
      }));

      return {
        id: asStr(r.id),
        nombre: r.nombre,
        // si luego agregas categoría a la rutina, ponla aquí; por ahora null
        categoria: null,
        dias: toDias(r.dias),
        ejercicios,
        alimentos,
        isPublished: Boolean(r.publicada),
      };
    });

    // Sin query de rutinas expandidas: vacío por ahora
    return [];
  }
}
