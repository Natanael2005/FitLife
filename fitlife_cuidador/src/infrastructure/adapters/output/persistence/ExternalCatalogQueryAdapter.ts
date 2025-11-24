import { DataSource } from 'typeorm';
import { CatalogQueryPort } from '../../../../application/ports/output/CatalogQueryPort';
import { getDataSource } from '../../../config/datasource';
import {
  SQL_GET_ALL_EXERCISES,
  SQL_GET_ALL_FOODS,
  SQL_GET_ALL_PUBLIC_ROUTINES_EXPANDED
} from '../../../config/catalog-queries';
import { cleanTokens } from '../../../../shared/tokens';

type Nivel = 'BAJO' | 'INTERMEDIO' | 'AVANZADO';

// -------- Helpers tipados (evitan 'never') --------
const asStr = (v: unknown): string =>
  v === null || v === undefined ? '' : String(v);

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
      // LIMPIO "NINGUNO" y similares → []
      contraindicaciones: cleanTokens(r.contraindicaciones),
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
    return rows.map((r: any) => {
      const caloriasRaw = r.calorias_por_100g ?? r.calorias;
      return {
        id: String(r.id),
        nombre: r.nombre,
        categoria: r.categoria ?? null,
        // LIMPIO "NINGUNO" → []
        alergenos: cleanTokens(r.alergenos),
        imagen: r.imagen ?? '',
        calorias: caloriasRaw != null ? Number(caloriasRaw) : null,
        proteinas: r.proteinas != null ? Number(r.proteinas) : null,
        isActive: Boolean(r.activo),
      };
    });
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
        // LIMPIO tokens anidados
        contraindicaciones: cleanTokens(e.contraindicaciones ?? []),
        nivel: mapNivel(e.nivel),
        series_recomendadas: e.series_recomendadas ?? null,
        repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
        gifUrl: e.gif_url ?? '',
        musculo_principal: e.musculo_principal ?? null,
        musculo_secundario: e.musculo_secundario ?? null,
        instrucciones: toStringArray(e.instrucciones),
        isActive: e.activo != null ? Boolean(e.activo) : true,
      }));

      const alimentos = asArray(r.alimentos_json).map((f: any) => ({
        id: asStr(f.id),
        nombre: f.nombre,
        categoria: f.categoria ?? null,
        // LIMPIO tokens anidados
        alergenos: cleanTokens(f.alergenos ?? []),
        imagen: f.imagen ?? '',
        calorias: f.calorias != null ? Number(f.calorias) : null,
        proteinas: f.proteinas != null ? Number(f.proteinas) : null,
        isActive: f.activo != null ? Boolean(f.activo) : true,
      }));

      return {
        id: asStr(r.id),
        nombre: r.nombre,
        categoria: null,
        dias: toDias(r.dias),
        ejercicios,
        alimentos,
        isPublished: Boolean(r.publicada),
      };
    });
  }
}
