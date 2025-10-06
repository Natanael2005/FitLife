import { Router } from 'express';
import { firebaseAuth } from '../middlewares/firebaseAuth';
import { getDataSource } from '../../../../config/datasource';
import { Exercise } from '../../../../../domain/entities/demo/Exercise';
import { Food } from '../../../../../domain/entities/demo/Food';
import { PublicRoutine } from '../../../../../domain/entities/demo/PublicRoutine';
import { RoutineExercise } from '../../../../../domain/entities/demo/RoutineExercise';
import { RoutineFood } from '../../../../../domain/entities/demo/RoutineFood';

const r = Router();

// GET /api/catalogo-demo/ejercicios
r.get('/ejercicios', firebaseAuth, async (_req, res) => {
  try {
    const ds = await getDataSource();
    const list = await ds.getRepository(Exercise).find({ order: { slug: 'ASC' } });
    res.json(list);
  } catch (e: any) {
    console.error('GET ejercicios:', e?.message || e);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /api/catalogo-demo/alimentos
r.get('/alimentos', firebaseAuth, async (_req, res) => {
  try {
    const ds = await getDataSource();
    const list = await ds.getRepository(Food).find({ order: { slug: 'ASC' } });
    res.json(list);
  } catch (e: any) {
    console.error('GET alimentos:', e?.message || e);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /api/catalogo-demo/rutinas  (expandido: incluye snapshots de ejercicios y alimentos)
r.get('/rutinas', firebaseAuth, async (_req, res) => {
  try {
    const ds = await getDataSource();
    const rRepo = ds.getRepository(PublicRoutine);
    const reRepo = ds.getRepository(RoutineExercise);
    const rfRepo = ds.getRepository(RoutineFood);
    const eRepo = ds.getRepository(Exercise);
    const fRepo = ds.getRepository(Food);

    const rutinas = await rRepo.find({ order: { slug: 'ASC' } });
    const routineIds = rutinas.map(r => r.id);

    // joins
    const joinsE = routineIds.length ? await reRepo.find() : [];
    const joinsF = routineIds.length ? await rfRepo.find() : [];

    // carga en bloque
    const exerciseIds = Array.from(new Set(joinsE.map(j => j.exercise_id)));
    const foodIds = Array.from(new Set(joinsF.map(j => j.food_id)));
    const allE = exerciseIds.length ? await eRepo.findByIds(exerciseIds) : [];
    const allF = foodIds.length ? await fRepo.findByIds(foodIds) : [];

    const eMap = new Map(allE.map(e => [e.id, e]));
    const fMap = new Map(allF.map(f => [f.id, f]));

    const expanded = rutinas.map(r => {
      const eIds = joinsE.filter(j => j.routine_id === r.id).sort((a,b)=>a.orden-b.orden).map(j => j.exercise_id);
      const fIds = joinsF.filter(j => j.routine_id === r.id).sort((a,b)=>a.orden-b.orden).map(j => j.food_id);
      return {
        id: r.id,
        nombre: r.nombre,
        dias: r.dias,
        ejercicios: eIds.map(id => eMap.get(id)).filter(Boolean),
        alimentos: fIds.map(id => fMap.get(id)).filter(Boolean),
      };
    });

    res.json(expanded);
  } catch (e: any) {
    console.error('GET rutinas:', e?.message || e);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default r;
