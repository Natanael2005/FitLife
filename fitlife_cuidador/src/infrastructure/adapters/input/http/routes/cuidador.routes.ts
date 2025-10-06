import { Router } from 'express';
import { z } from 'zod';
import { getDataSource } from '../../../../config/datasource';

// Servicio + adapters
import { CuidadorService } from '../../../../../application/services/CuidadorService';
import { UserHealthQueryAdapter } from '../../../output/persistence/UserHealthQueryAdapter';
import { ExternalCatalogQueryAdapter } from '../../../output/persistence/ExternalCatalogQueryAdapter';

import {
  CatalogExercise,
  CatalogFood,
  CatalogRoutine,
} from '../../../../../application/ports/output/CatalogQueryPort';

const r = Router();

const up = (s?: string | null) => (s ?? '').toUpperCase();
const upArr = (a?: string[] | null) => (a ?? []).map(x => (x ?? '').toUpperCase());
const toNivelArray = (nivel: 'PRINCIPIANTE'|'INTERMEDIO'|'AVANZADO') => [nivel];

// ===== DI simple por request =====
async function buildService() {
  const ds = await getDataSource();
  const health = new UserHealthQueryAdapter(ds);
  const catalogAdapter = new ExternalCatalogQueryAdapter(ds);
  return new CuidadorService(health, catalogAdapter);
}

// ===== Validaciones =====
const qSchema = z.object({ userId: z.string().uuid() });

const ExerciseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nombre: z.string(),
  categoria: z.string().optional(),
  contraindicaciones: z.array(z.string()).default([]),
  nivel: z.enum(['PRINCIPIANTE','INTERMEDIO','AVANZADO']),
  series_recomendadas: z.number().optional(),
  repeticiones_recomendadas: z.number().optional(),
});

const FoodSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nombre: z.string(),
  categoria: z.string().optional(),
  alergenos: z.array(z.string()).default([]),
});

const RoutineSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  nombre: z.string(),
  dias: z.array(z.string()).default([]),
  ejercicios: z.array(ExerciseSchema).default([]),
  alimentos: z.array(FoodSchema).default([]),
});

// ===== GET automáticos (inter-servicio: sin token) =====
r.get('/ejercicios-aptos', async (req, res) => {
  const parse = qSchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  const svc = await buildService();
  const ejercicios = await svc.getAllowedExercises(parse.data.userId);

  const out = ejercicios.map(e => ({
    id: e.id,
    nombre: e.nombre,
    categoria: e.categoria ?? null,
    contraindicaciones: upArr(e.contraindicaciones),
    nivel_minimo: toNivelArray(e.nivel as any),
    series_recomendadas: e.series_recomendadas ?? null,
    repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
    gifUrl: "",
    musculo_principal: "",
    musculo_secundario: "",
    instrucciones: [] as string[],
  }));

  res.json(out);
});

r.get('/alimentos-aptos', async (req, res) => {
  const parse = qSchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  const svc = await buildService();
  const alimentos = await svc.getAllowedFoods(parse.data.userId);

  const out = alimentos.map(f => ({
    id: f.id,
    nombre: f.nombre,
    categoria: f.categoria ?? null,
    alergenos: upArr(f.alergenos),
    imagen: "",
    calorias_por_100g: null as number | null,
    proteinas: null as number | null,
  }));

  res.json(out);
});

r.get('/aptos', async (req, res) => {
  const parsed = qSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
  }

  try {
    const svc = await buildService();
    const { ejercicios, alimentos } = await svc.getAllowedForBuilder(parsed.data.userId);

    const ejerciciosOut = ejercicios.map(e => ({
      id: e.id,
      nombre: e.nombre,
      categoria: e.categoria ?? null,
      contraindicaciones: upArr(e.contraindicaciones),   // UPPER
      nivel: toNivelArray(e.nivel as any),        // array
      series_recomendadas: e.series_recomendadas ?? null,
      repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
      gifUrl: "",
      musculo_principal: "",
      musculo_secundario: "",
      instrucciones: [] as string[],
    }));

    const alimentosOut = alimentos.map(f => ({
      id: f.id,
      nombre: f.nombre,
      categoria: f.categoria ?? null,
      alergenos: upArr(f.alergenos),           // UPPER
      imagen: "",
      calorias_por_100g: null as number | null,
      proteinas: null as number | null,
    }));

    res.json({ ejercicios: ejerciciosOut, alimentos: alimentosOut });
  } catch (err: any) {
    if (err?.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Ficha de salud no encontrada' });
    }
    console.error('[cuidador/aptos] error', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});


r.get('/rutinas-aptas', async (req, res) => {
  const parse = qSchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  const svc = await buildService();
  const rutinas = await svc.getAllowedRoutines(parse.data.userId);

  const out = rutinas.map(r => ({
    id: r.id,
    nombre: r.nombre,
    dias: r.dias ?? [],
    ejercicios: r.ejercicios.map(e => ({
      id: e.id,
      nombre: e.nombre,
      categoria: e.categoria ?? null,
      contraindicaciones: upArr(e.contraindicaciones),
      nivel: toNivelArray(e.nivel as any),
      series_recomendadas: e.series_recomendadas ?? null,
      repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
      gifUrl: "",
      musculo_principal: "",
      musculo_secundario: "",
      instrucciones: [] as string[],
    })),
    alimentos: r.alimentos.map(f => ({
      id: f.id,
      nombre: f.nombre,
      categoria: f.categoria ?? null,
      alergenos: upArr(f.alergenos),
      imagen: "",
      calorias_por_100g: null as number | null,
      proteinas: null as number | null,
    })),
  }));

  res.json(out);
});

r.get('/todo-aptos', async (req, res) => {
  const parse = qSchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  const svc = await buildService();
  const out = await svc.getAllowedForBuilder(parse.data.userId);
  res.json(out);
});

// ===== POST de prueba (opcional) =====
r.post('/filtrar-ejercicios', async (req, res) => {
  const body = z.object({ userId: z.string().uuid(), ejercicios: z.array(ExerciseSchema).nonempty() }).parse(req.body);
  const svc = await buildService();
  res.json(await svc.filterExercises(body.userId, body.ejercicios as unknown as CatalogExercise[]));
});

r.post('/filtrar-alimentos', async (req, res) => {
  const body = z.object({ userId: z.string().uuid(), alimentos: z.array(FoodSchema).nonempty() }).parse(req.body);
  const svc = await buildService();
  res.json(await svc.filterFoods(body.userId, body.alimentos as unknown as CatalogFood[]));
});

r.post('/filtrar-todo', async (req, res) => {
  const body = z.object({
    userId: z.string().uuid(),
    ejercicios: z.array(ExerciseSchema).default([]),
    alimentos: z.array(FoodSchema).default([]),
  }).parse(req.body);
  const svc = await buildService();
  res.json(await svc.filterBoth(body.userId, { ejercicios: body.ejercicios as any, alimentos: body.alimentos as any }));
});

r.post('/filtrar-rutinas', async (req, res) => {
  const body = z.object({ userId: z.string().uuid(), rutinas: z.array(RoutineSchema).nonempty() }).parse(req.body);
  const svc = await buildService();
  res.json(await svc.filterRoutines(body.userId, body.rutinas as unknown as CatalogRoutine[]));
});

export default r;
export { r as cuidadorRouter };