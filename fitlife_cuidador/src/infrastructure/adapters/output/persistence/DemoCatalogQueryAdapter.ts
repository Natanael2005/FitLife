import { DataSource } from 'typeorm';
import {
  CatalogQueryPort, CatalogExercise, CatalogFood, CatalogRoutine,
} from '../../../../application/ports/output/CatalogQueryPort';
import { Exercise } from '../../../../domain/entities/demo/Exercise';
import { Food } from '../../../../domain/entities/demo/Food';
import { PublicRoutine } from '../../../../domain/entities/demo/PublicRoutine';
import { RoutineExercise } from '../../../../domain/entities/demo/RoutineExercise';
import { RoutineFood } from '../../../../domain/entities/demo/RoutineFood';

const toUpperArr = (arr?: string[] | null) => (arr ?? []).map(s => s.toUpperCase());

export class DemoCatalogQueryAdapter implements CatalogQueryPort {
  constructor(private readonly ds: DataSource) {}

  async getAllExercises(): Promise<CatalogExercise[]> {
    const repo = this.ds.getRepository(Exercise);
    const exs = await repo.find();
    return exs.map(e => ({
      id: e.id,
      slug: (e.slug ?? '').toUpperCase(),
      nombre: e.nombre,
      categoria: e.categoria,
      contraindicaciones: toUpperArr(e.contraindicaciones),
      nivel: e.nivel as any, // 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO'
      series_recomendadas: e.series_recomendadas ?? null,
      repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
    }));
  }

  async getAllFoods(): Promise<CatalogFood[]> {
    const repo = this.ds.getRepository(Food);
    const foods = await repo.find();
    return foods.map(f => ({
      id: f.id,
      slug: (f.slug ?? '').toUpperCase(),
      nombre: f.nombre,
      categoria: f.categoria,
      alergenos: toUpperArr(f.alergenos),
    }));
  }

  async getAllPublicRoutinesExpanded(): Promise<CatalogRoutine[]> {
    const rRepo = this.ds.getRepository(PublicRoutine);
    const reRepo = this.ds.getRepository(RoutineExercise);
    const rfRepo = this.ds.getRepository(RoutineFood);
    const eRepo = this.ds.getRepository(Exercise);
    const fRepo = this.ds.getRepository(Food);

    const rutinas = await rRepo.find();
    const [allRE, allRF, allE, allF] = await Promise.all([
      reRepo.find(), rfRepo.find(), eRepo.find(), fRepo.find(),
    ]);

    const eById = new Map(allE.map(e => [e.id, e]));
    const fById = new Map(allF.map(f => [f.id, f]));

    return rutinas.map(r => {
      const re = allRE.filter(x => x.routine_id === r.id).sort((a,b) => a.orden - b.orden);
      const rf = allRF.filter(x => x.routine_id === r.id).sort((a,b) => a.orden - b.orden);

      const ejercicios: CatalogExercise[] = re.map(x => {
        const e = eById.get(x.exercise_id)!;
        return {
          id: e.id,
          slug: (e.slug ?? '').toUpperCase(),
          nombre: e.nombre,
          categoria: e.categoria,
          contraindicaciones: toUpperArr(e.contraindicaciones),
          nivel: e.nivel as any,
          series_recomendadas: e.series_recomendadas ?? null,
          repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
        };
      });

      const alimentos: CatalogFood[] = rf.map(x => {
        const f = fById.get(x.food_id)!;
        return {
          id: f.id,
          slug: (f.slug ?? '').toUpperCase(),
          nombre: f.nombre,
          categoria: f.categoria,
          alergenos: toUpperArr(f.alergenos),
        };
      });

      return {
        id: r.id,
        slug: r.slug, // el slug de rutina no se usa en reglas
        nombre: r.nombre,
        dias: r.dias ?? [],
        ejercicios,
        alimentos,
      };
    });
  }
}
