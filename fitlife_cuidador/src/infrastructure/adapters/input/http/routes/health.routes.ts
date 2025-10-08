import { Router } from 'express';
import { z } from 'zod';
import { In, FindOptionsWhere, DataSource, EntityManager } from 'typeorm';
import { isUUID } from 'validator';

import { firebaseAuth } from '../middlewares/firebaseAuth';
import { getDataSource } from '../../../../config/datasource';

import { Allergy } from '../../../../../domain/entities/Allergy';
import { MedicalCondition } from '../../../../../domain/entities/MedicalCondition';
import { User } from '../../../../../domain/entities/User';
import { UserHealthData, CategoriaIMC, Nivel } from '../../../../../domain/entities/UserHealthData';
import { UserAllergy } from '../../../../../domain/entities/UserAllergy';
import { UserMedicalCondition } from '../../../../../domain/entities/UserMedicalCondition';

const r = Router();

/* =========================
   GET /api/health/options  (Bearer)
   ========================= */
r.get('/options', firebaseAuth, async (_req, res) => {
  try {
    const ds = await getDataSource();
    const [allergies, conditions] = await Promise.all([
      ds.getRepository(Allergy).find({ order: { slug: 'ASC' } }),
      ds.getRepository(MedicalCondition).find({ order: { slug: 'ASC' } }),
    ]);
    res.json({ allergies, conditions });
  } catch (err: any) {
    console.error('GET /api/health/options error:', err?.message || err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'No se pudieron cargar los catálogos' });
  }
});

/* =========================
   PUT /api/health/user/:id (Bearer)
   Acepta UUID o slug en alergias/condiciones
   Guarda siempre UUID en puentes
   ========================= */
const bodySchema = z.object({
  pesoKg: z.number().positive(),
  estaturaCm: z.number().int().min(100).max(250),
  nivel: z.enum(['BAJO', 'INTERMEDIO', 'AVANZADO']),
  alergias: z.array(z.string().min(1)).default([]),     // uuid o slug
  condiciones: z.array(z.string().min(1)).default([]),  // uuid o slug
});

r.put('/user/:id', firebaseAuth, async (req, res) => {
  try {
    const parse = bodySchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
    }

    const { id } = req.params; // users.id (UUID)
    const { firebaseUid } = (req as any).user;
    const ds = await getDataSource();

    // Ownership por UID
    const userRepo = ds.getRepository(User);
    const user = await userRepo.findOne({ where: { firebaseUid } });
    if (!user || user.id !== id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const { pesoKg, estaturaCm, nivel, alergias, condiciones } = parse.data;
    const { imc, categoria_imc } = computeIMCNullable(pesoKg, estaturaCm);
    const imcStr = imc != null ? imc.toFixed(2) : undefined;

    await ds.transaction(async (tx) => {
      const hRepo = tx.getRepository(UserHealthData);
      const existing = await hRepo.findOne({ where: { user_id: id } as any });

      if (existing) {
        const patch: any = {
          peso_kg: pesoKg.toFixed(2),
          estatura_cm: estaturaCm,
          nivel: nivel as Nivel,
        };
        if (imcStr !== undefined) patch.imc = imcStr;
        if (categoria_imc !== null) patch.categoria_imc = categoria_imc;
        await hRepo.update({ user_id: id } as any, patch);
      } else {
        const toInsert: any = {
          user_id: id,
          peso_kg: pesoKg.toFixed(2),
          estatura_cm: estaturaCm,
          nivel: nivel as Nivel,
        };
        if (imcStr !== undefined) toInsert.imc = imcStr;
        if (categoria_imc !== null) toInsert.categoria_imc = categoria_imc;
        await hRepo.insert(toInsert);
      }

      // Resolver a UUIDs (allergies / conditions)
      const allergyIds = await resolveAllergyUuids(tx, alergias);
      const conditionIds = await resolveConditionUuids(tx, condiciones);

      // Sync alergias
      const uaRepo = tx.getRepository(UserAllergy);
      await uaRepo.delete({ user_id: id } as any);
      if (allergyIds.length) await uaRepo.insert(allergyIds.map((aid) => ({ user_id: id, allergy_id: aid } as any)));

      // Sync condiciones
      const umcRepo = tx.getRepository(UserMedicalCondition);
      await umcRepo.delete({ user_id: id } as any);
      if (conditionIds.length) await umcRepo.insert(conditionIds.map((cid) => ({ user_id: id, condition_id: cid } as any)));

      // profile_completed = true
      await tx.getRepository(User).update({ id }, { profileCompleted: true });
    });

    // Snapshot (con IMC)
    return res.status(200).json({
      userId: id,
      pesoKg,
      estaturaCm,
      nivel,
      imc: imc != null ? Number(imc.toFixed(2)) : null,
      categoria_imc: categoria_imc,
      profile_completed: true,
    });
  } catch (err: any) {
    console.error('PUT /api/health/user/:id error:', err?.message || err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'No se pudo guardar la ficha' });
  }
});

/* =========================
   Endpoints PÚBLICOS (sin Bearer) con x-uid
   GET /api/health/public/user/:id
   PUT /api/health/public/user/:id
   ========================= */

// uid desde header x-uid o query ?uid=
function getUid(req: any): string {
  const h = String(req.headers['x-uid'] ?? '').trim();
  if (h) return h;
  return String(req.query?.uid ?? '').trim();
}

const publicParamsSchema = z.object({ id: z.string().uuid() });
const publicUidSchema = z.object({ uid: z.string().min(6) });

// SOLO slugs; si envías pesoKg debes enviar estaturaCm
const publicPutBodySchema = z.object({
  pesoKg: z.number().positive().max(500).optional(),
  estaturaCm: z.number().int().positive().max(300).optional(),
  nivel: z.enum(['BAJO','INTERMEDIO','AVANZADO']).optional(),
  alergias: z.array(z.string().min(1)).optional(),     // slugs
  condiciones: z.array(z.string().min(1)).optional(),  // slugs
}).refine(
  b => (b.pesoKg === undefined) || (b.estaturaCm !== undefined),
  { message: 'Si envías pesoKg debes enviar estaturaCm para recalcular IMC.' }
);

/* -------------------------
   GET /api/health/public/user/:id
   sin Bearer, requiere x-uid
------------------------- */
r.get('/public/user/:id', async (req, res) => {
  try {
    const { id } = publicParamsSchema.parse(req.params);
    const uid = getUid(req);
    publicUidSchema.parse({ uid });

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (user.firebaseUid !== uid) return res.status(403).json({ error: 'FORBIDDEN' });

    const hRepo = ds.getRepository(UserHealthData);
    const uaRepo = ds.getRepository(UserAllergy);
    const umcRepo = ds.getRepository(UserMedicalCondition);
    const allergyRepo = ds.getRepository(Allergy);
    const medRepo = ds.getRepository(MedicalCondition);

    const health = await hRepo.findOne({ where: { user_id: id } as any });
    const uas = await uaRepo.find({ where: { user_id: id } as any });
    const umcs = await umcRepo.find({ where: { user_id: id } as any });

    const [allergies, conditions] = await Promise.all([
      uas.length
        ? allergyRepo.createQueryBuilder('a')
            .where('a.id IN (:...ids)', { ids: uas.map(a => (a as any).allergy_id) })
            .getMany()
        : Promise.resolve([]),
      umcs.length
        ? medRepo.createQueryBuilder('m')
            .where('m.id IN (:...ids)', { ids: umcs.map(c => (c as any).condition_id) })
            .getMany()
        : Promise.resolve([]),
    ]);

    // Si hay IMC guardado y es numérico, úsalo; si no, calcula al vuelo
    const imcDb = health?.imc != null ? Number(health.imc) : null;
    const catDb = health?.categoria_imc ?? null;
    const calc = computeIMCNullable(
      health?.peso_kg != null ? Number(health.peso_kg) : undefined,
      health?.estatura_cm ?? undefined
    );
    const imc = imcDb ?? calc.imc;
    const categoria_imc = catDb ?? calc.categoria_imc;

    // devolver SLUG y NOMBRE (no IDs)
    const alergias = allergies.map(a => ({
      slug: a.slug,
      nombre: (a as any).name ?? (a as any).nombre ?? a.slug,
    }));
    const condiciones = conditions.map(c => ({
      slug: c.slug,
      nombre: (c as any).name ?? (c as any).nombre ?? c.slug,
    }));

    return res.json({
      userId: id,
      pesoKg: health?.peso_kg != null ? Number(health.peso_kg) : null,
      estaturaCm: health?.estatura_cm ?? null,
      nivel: (health?.nivel as Nivel) ?? null, // 'BAJO'|'INTERMEDIO'|'AVANZADO'
      imc,
      categoria_imc,
      alergias,
      condiciones,
    });
  } catch (err: any) {
    console.error('GET /public/user/:id', err?.message || err);
    return res.status(400).json({ error: 'BAD_REQUEST' });
  }
});

/* -------------------------
   PUT /api/health/public/user/:id
   sin Bearer, requiere x-uid
   Acepta SOLO slugs en alergias/condiciones
------------------------- */
r.put('/public/user/:id', async (req, res) => {
  const ds = await getDataSource();
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const { id } = publicParamsSchema.parse(req.params);
    const uid = getUid(req);
    publicUidSchema.parse({ uid });
    const body = publicPutBodySchema.parse(req.body ?? {});

    const user = await qr.manager.getRepository(User).findOne({ where: { id } });
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (user.firebaseUid !== uid) return res.status(403).json({ error: 'FORBIDDEN' });

    // Upsert parcial de ficha
    const hRepo = qr.manager.getRepository(UserHealthData);
    const existing = await hRepo.findOne({ where: { user_id: id } as any });

    const nextPeso = body.pesoKg ?? (existing?.peso_kg != null ? Number(existing.peso_kg) : null);
    const nextEst  = body.estaturaCm ?? (existing?.estatura_cm ?? null);
    const nextNivel: Nivel = body.nivel ?? (existing?.nivel as Nivel) ?? 'BAJO';

    // Si no existe, exigir peso+estatura
    if (!existing && (nextPeso == null || nextEst == null)) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Se requieren pesoKg y estaturaCm para crear la ficha.' });
    }

    const { imc, categoria_imc } = computeIMCNullable(nextPeso ?? undefined, nextEst ?? undefined);
    const imcStr = imc != null ? imc.toFixed(2) : undefined;

    if (existing) {
      const patch: any = { nivel: nextNivel };
      if (nextPeso != null) patch.peso_kg = Number(nextPeso).toFixed(2);
      if (nextEst  != null) patch.estatura_cm = nextEst;
      if (imcStr !== undefined) patch.imc = imcStr;
      if (categoria_imc !== null) patch.categoria_imc = categoria_imc;
      await hRepo.update({ user_id: id } as any, patch);
    } else {
      const toInsert: any = {
        user_id: id,
        peso_kg: Number(nextPeso!).toFixed(2),
        estatura_cm: nextEst!,
        nivel: nextNivel,
      };
      if (imcStr !== undefined) toInsert.imc = imcStr;
      if (categoria_imc !== null) toInsert.categoria_imc = categoria_imc;
      await hRepo.insert(toInsert);
    }

    // Puentes por SLUG → UUIDs
    if (Array.isArray(body.alergias)) {
      const uuids = await resolveAllergyIdsBySlugs(qr.manager, body.alergias);
      const uaRepo = qr.manager.getRepository(UserAllergy);
      await uaRepo.delete({ user_id: id } as any);
      if (uuids.length) await uaRepo.insert(uuids.map(aid => ({ user_id: id, allergy_id: aid } as any)));
    }
    if (Array.isArray(body.condiciones)) {
      const uuids = await resolveConditionIdsBySlugs(qr.manager, body.condiciones);
      const umcRepo = qr.manager.getRepository(UserMedicalCondition);
      await umcRepo.delete({ user_id: id } as any);
      if (uuids.length) await umcRepo.insert(uuids.map(cid => ({ user_id: id, condition_id: cid } as any)));
    }

    await qr.commitTransaction();

    // Snapshot final con SLUG + NOMBRE
    const [allergies, conditions, health] = await Promise.all([
      ds.getRepository(Allergy)
        .createQueryBuilder('a')
        .innerJoin(UserAllergy, 'ua', 'ua.allergy_id = a.id AND ua.user_id = :id', { id })
        .getMany(),
      ds.getRepository(MedicalCondition)
        .createQueryBuilder('m')
        .innerJoin(UserMedicalCondition, 'um', 'um.condition_id = m.id AND um.user_id = :id', { id })
        .getMany(),
      ds.getRepository(UserHealthData).findOne({ where: { user_id: id } as any }),
    ]);

    const alergias = allergies.map(a => ({
      slug: a.slug,
      nombre: (a as any).name ?? (a as any).nombre ?? a.slug,
    }));
    const condiciones = conditions.map(c => ({
      slug: c.slug,
      nombre: (c as any).name ?? (c as any).nombre ?? c.slug,
    }));

    const imcNum = health?.imc != null ? Number(health.imc) : null;
    const cat = health?.categoria_imc ?? null;

    return res.json({
      userId: id,
      pesoKg: health?.peso_kg != null ? Number(health.peso_kg) : null,
      estaturaCm: health?.estatura_cm ?? null,
      nivel: (health?.nivel as Nivel) ?? nextNivel,
      imc: imcNum,
      categoria_imc: cat,
      alergias,
      condiciones,
    });
  } catch (err: any) {
    await qr.rollbackTransaction();
    console.error('PUT /public/user/:id', err?.message || err);
    return res.status(400).json({ error: 'BAD_REQUEST' });
  } finally {
    await qr.release();
  }
});

/* =========================
   Helpers compartidos
   ========================= */

// Acepta undefined/null y devuelve IMC/categoría o null
function computeIMCNullable(
  pesoKg?: number | null,
  estaturaCm?: number | null
): { imc: number | null; categoria_imc: CategoriaIMC | null } {
  if (!pesoKg || !estaturaCm || pesoKg <= 0 || estaturaCm <= 0) {
    return { imc: null, categoria_imc: null };
  }
  const m = estaturaCm / 100;
  const imc = +(pesoKg / (m * m)).toFixed(2);
  let categoria: CategoriaIMC;
  if (imc < 18.5) categoria = 'BAJO_PESO';
  else if (imc < 25) categoria = 'NORMAL';
  else if (imc < 30) categoria = 'SOBREPESO';
  else if (imc < 35) categoria = 'OBESIDAD_I';
  else if (imc < 40) categoria = 'OBESIDAD_II';
  else categoria = 'OBESIDAD_III';
  return { imc, categoria_imc: categoria };
}

type TxLike = DataSource | EntityManager;

// Resolver UUIDs desde entradas mixtas (uuid o slug) — usado en PUT privado
async function resolveAllergyUuids(dsOrTx: TxLike, inputs: string[]): Promise<string[]> {
  if (inputs.length === 0) return [];
  const aRepo = dsOrTx.getRepository(Allergy);
  const uuids = inputs.filter((v) => isUUID(v));
  const slugs = inputs.filter((v) => !isUUID(v));
  const where: FindOptionsWhere<Allergy>[] = [];
  if (uuids.length) where.push({ id: In(uuids) });
  if (slugs.length) where.push({ slug: In(slugs) });
  const found = await aRepo.find({ where });
  return found.map((a) => a.id);
}
async function resolveConditionUuids(dsOrTx: TxLike, inputs: string[]): Promise<string[]> {
  if (inputs.length === 0) return [];
  const cRepo = dsOrTx.getRepository(MedicalCondition);
  const uuids = inputs.filter((v) => isUUID(v));
  const slugs = inputs.filter((v) => !isUUID(v));
  const where: FindOptionsWhere<MedicalCondition>[] = [];
  if (uuids.length) where.push({ id: In(uuids) });
  if (slugs.length) where.push({ slug: In(slugs) });
  const found = await cRepo.find({ where });
  return found.map((c) => c.id);
}

// Resolver UUIDs por slugs — usado en PUT público
async function resolveAllergyIdsBySlugs(dsOrTx: DataSource | EntityManager, slugs: string[]): Promise<string[]> {
  if (!slugs?.length) return [];
  const repo = dsOrTx.getRepository(Allergy);
  const rows = await repo.createQueryBuilder('a').where('a.slug IN (:...slugs)', { slugs }).getMany();
  return rows.map(r => r.id);
}
async function resolveConditionIdsBySlugs(dsOrTx: DataSource | EntityManager, slugs: string[]): Promise<string[]> {
  if (!slugs?.length) return [];
  const repo = dsOrTx.getRepository(MedicalCondition);
  const rows = await repo.createQueryBuilder('m').where('m.slug IN (:...slugs)', { slugs }).getMany();
  return rows.map(r => r.id);
}

export default r;
