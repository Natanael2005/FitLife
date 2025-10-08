import { Router } from "express";
import { z } from "zod";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { getDataSource } from "../../../../config/datasource";
import { HealthPersistenceAdapter } from "../../../output/persistence/HealthPersistenceAdapter";
import { HealthService } from "../../../../../application/services/HealthService";
import { Nivel } from "../../../../../domain/entities/UserHealthData";

const r = Router();

/* ========== Schemas ========== */
const publicParams = z.object({ id: z.string().uuid() });

const publicPutBody = z.object({
  pesoKg: z.number().positive().max(500).optional(),
  estaturaCm: z.number().int().positive().max(300).optional(),
  nivel: z.enum(['BAJO','INTERMEDIO','AVANZADO']).optional(),
  alergias: z.array(z.string().min(1)).optional(),     // slugs
  condiciones: z.array(z.string().min(1)).optional(),  // slugs
});

const privatePutBody = z.object({
  pesoKg: z.number().positive(),
  estaturaCm: z.number().int().min(100).max(250),
  nivel: z.enum(['BAJO','INTERMEDIO','AVANZADO']),
  alergias: z.array(z.string().min(1)).default([]),
  condiciones: z.array(z.string().min(1)).default([]),
});

/* ========== Opciones (Bearer) ========== */
r.get("/options", firebaseAuth, async (_req, res) => {
  try {
    const ds = await getDataSource();
    const allergiesRepo = ds.getRepository(require('../../../../../domain/entities/Allergy').Allergy);
    const medRepo = ds.getRepository(require('../../../../../domain/entities/MedicalCondition').MedicalCondition);
    const [allergies, conditions] = await Promise.all([
      allergiesRepo.find({ order: { slug: "ASC" } }),
      medRepo.find({ order: { slug: "ASC" } }),
    ]);
    res.json({ allergies, conditions });
  } catch (e) {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

/* ========== PUT privado (Bearer) cuestionario ========== */
r.put("/user/:id", firebaseAuth, async (req, res) => {
  try {
    const body = privatePutBody.parse(req.body);
    const { id } = req.params;
    const firebaseUid = (req as any).user.firebaseUid as string;

    const ds = await getDataSource();
    const service = new HealthService(new HealthPersistenceAdapter(ds));

    const out = await service.putPrivate(id, firebaseUid, {
      pesoKg: body.pesoKg,
      estaturaCm: body.estaturaCm,
      nivel: body.nivel as Nivel,
      alergias: body.alergias,
      condiciones: body.condiciones,
    });

    return res.json({ ...out, profile_completed: true });
  } catch (e: any) {
    if (e.message === "USER_NOT_FOUND") return res.status(404).json({ error: e.message });
    if (e.message === "FORBIDDEN") return res.status(403).json({ error: e.message });
    return res.status(400).json({ error: "BAD_REQUEST", message: e?.message });
  }
});

/* ========== GET público (solo UUID) ========== */
r.get("/public/user/:id", async (req, res) => {
  try {
    const { id } = publicParams.parse(req.params);

    const ds = await getDataSource();
    const service = new HealthService(new HealthPersistenceAdapter(ds));

    const out = await service.getPublicById(id);
    return res.json(out);
  } catch (e: any) {
    if (e.message === "USER_NOT_FOUND") return res.status(404).json({ error: e.message });
    return res.status(400).json({ error: "BAD_REQUEST", message: e?.message });
  }
});

/* ========== PUT público (solo UUID) ========== */
r.put("/public/user/:id", async (req, res) => {
  try {
    const { id } = publicParams.parse(req.params);
    const body = publicPutBody.parse(req.body ?? {});

    const ds = await getDataSource();
    const service = new HealthService(new HealthPersistenceAdapter(ds));

    const out = await service.putPublicById(id, {
      pesoKg: body.pesoKg,
      estaturaCm: body.estaturaCm,
      nivel: body.nivel as Nivel | undefined,
      alergias: body.alergias,
      condiciones: body.condiciones,
    });

    return res.json(out);
  } catch (e: any) {
    if (e.message === "USER_NOT_FOUND") return res.status(404).json({ error: e.message });
    if (e.message === "MISSING_FIELDS") return res.status(400).json({ error: e.message });
    if (e.message === "NEED_HEIGHT") return res.status(400).json({ error: e.message });
    return res.status(400).json({ error: "BAD_REQUEST", message: e?.message });
  }
});

export default r;
