import { Router } from 'express';
import { z } from 'zod';
import { DeepPartial } from 'typeorm';
import { firebaseAuth } from '../middlewares/firebaseAuth';
import { getDataSource } from '../../../../config/datasource';
import { Allergy } from '../../../../../domain/entities/Allergy';
import { MedicalCondition } from '../../../../../domain/entities/MedicalCondition';
import { User } from '../../../../../domain/entities/User';
import { UserHealthData, CategoriaIMC, Nivel } from '../../../../../domain/entities/UserHealthData';
import { UserAllergy } from '../../../../../domain/entities/UserAllergy';
import { UserMedicalCondition } from '../../../../../domain/entities/UserMedicalCondition';

const r = Router();

// GET /api/health/options
r.get('/options', firebaseAuth, async (_req, res) => {
  const ds = await getDataSource();
  const [allergies, conditions] = await Promise.all([
    ds.getRepository(Allergy).find({ order: { id: 'ASC' } }),
    ds.getRepository(MedicalCondition).find({ order: { id: 'ASC' } }),
  ]);
  res.json({ allergies, conditions });
});

const bodySchema = z.object({
  pesoKg: z.number().positive(),
  estaturaCm: z.number().int().min(100).max(250),
  nivel: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO']),
  alergias: z.array(z.string().min(1)).default([]),
  condiciones: z.array(z.string().min(1)).default([]),
});

// PUT /api/health/user/:id
r.put('/user/:id', firebaseAuth, async (req, res) => {
  try {
    const parse = bodySchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });
    }

    const { id } = req.params;
    const { firebaseUid } = (req as any).user;
    const ds = await getDataSource();

    // Validar ownership por UID
    const userRepo = ds.getRepository(User);
    const user = await userRepo.findOne({ where: { firebaseUid } });
    if (!user || user.id !== id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const { pesoKg, estaturaCm, nivel, alergias, condiciones } = parse.data;
    const { imc, categoria } = computeIMC(pesoKg, estaturaCm);

    await ds.transaction(async (tx) => {
      const hRepo = tx.getRepository(UserHealthData);

      const existing = await hRepo.findOne({ where: { user_id: id } });
      const entity = existing ?? (hRepo.create({ user_id: id }) as UserHealthData);

      entity.peso_kg = pesoKg.toFixed(2);
      entity.estatura_cm = estaturaCm;
      entity.imc = imc.toFixed(2);
      entity.categoria_imc = categoria;
      entity.nivel = nivel as Nivel;

      await hRepo.save(entity);

      const uaRepo = tx.getRepository(UserAllergy);
      await uaRepo.delete({ user_id: id });
      if (alergias.length) {
        await uaRepo.insert(alergias.map((a) => ({ user_id: id, allergy_id: a })));
      }

      const umcRepo = tx.getRepository(UserMedicalCondition);
      await umcRepo.delete({ user_id: id });
      if (condiciones.length) {
        await umcRepo.insert(condiciones.map((c) => ({ user_id: id, condition_id: c })));
      }

      await tx.getRepository(User).update({ id }, { profileCompleted: true });
    });

    return res.status(200).json({ profile_completed: true });
  } catch (err: any) {
    console.error('PUT /api/health/user/:id error:', err?.message || err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'No se pudo guardar la ficha' });
  }
});

function computeIMC(pesoKg: number, estaturaCm: number): { imc: number; categoria: CategoriaIMC } {
  const m = estaturaCm / 100;
  const imc = pesoKg / (m * m);
  let categoria: CategoriaIMC;
  if (imc < 18.5) categoria = 'BAJO_PESO';
  else if (imc < 25) categoria = 'NORMAL';
  else if (imc < 30) categoria = 'SOBREPESO';
  else if (imc < 35) categoria = 'OBESIDAD_I';
  else if (imc < 40) categoria = 'OBESIDAD_II';
  else categoria = 'OBESIDAD_III';
  return { imc, categoria };
}

export default r;