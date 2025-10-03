import { Router } from 'express';
import { z } from 'zod';
import { getDataSource } from '../../../../config/datasource';

// Servicio + adapters
import { CuidadorService } from '../../../../../application/services/CuidadorService';
import { UserHealthQueryAdapter } from '../../../output/persistence/UserHealthQueryAdapter';
import { DemoCatalogQueryAdapter } from '../../../output/persistence/DemoCatalogQueryAdapter';

import {
  CatalogExercise,
  CatalogFood,
  CatalogRoutine,
} from '../../../../../application/ports/output/CatalogQueryPort';

const r = Router();

// ===== DI simple por request =====
async function buildService() {
  const ds = await getDataSource();
  const health = new UserHealthQueryAdapter(ds);
  const catalog = new DemoCatalogQueryAdapter(ds);
  return new CuidadorService(health, catalog);
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
  const out = await svc.getAllowedExercises(parse.data.userId);
  res.json(out);
});

r.get('/alimentos-aptos', async (req, res) => {
  const parse = qSchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  const svc = await buildService();
  const out = await svc.getAllowedFoods(parse.data.userId);
  res.json(out);
});

r.get('/rutinas-aptas', async (req, res) => {
  const parse = qSchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
  const svc = await buildService();
  const out = await svc.getAllowedRoutines(parse.data.userId);
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