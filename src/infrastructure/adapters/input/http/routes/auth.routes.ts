import { Router } from 'express';
import { z } from 'zod';
import { firebaseAuth } from '../middlewares/firebaseAuth';
import { getDataSource } from '../../../../config/datasource';
import { User } from '../../../../../domain/entities/User';

const r = Router();

// Validación inline (sin DTOs)
const registerBasicSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName:  z.string().trim().min(1),
  gender:    z.enum(['masculino','femenino','otro']).optional()
});

// POST /api/auth/register-basic
r.post('/register-basic', firebaseAuth, async (req, res) => {
  const parse = registerBasicSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.flatten() });

  const { firebaseUid, email } = (req as any).user;
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  // Buscar por UID o email para cubrir ambos casos
  let user = await repo.findOne({ where: [{ firebaseUid }, { email }] });
  const isNew = !user;

  if (!user) {
    user = repo.create({
      firebaseUid,
      email,
      firstName: parse.data.firstName,
      lastName:  parse.data.lastName,
      gender:    parse.data.gender ?? null,
      profileCompleted: false
    });
  } else {
    user.firstName = parse.data.firstName;
    user.lastName  = parse.data.lastName;
    user.gender    = parse.data.gender ?? null;
    if (email && email !== user.email) user.email = email; // sincroniza email si cambió en Firebase
  }

  user = await repo.save(user);
  return res.status(isNew ? 201 : 200).json({ id: user.id, profile_completed: user.profileCompleted });
});

// GET /api/auth/profile
r.get('/profile', firebaseAuth, async (req, res) => {
  const { firebaseUid } = (req as any).user;

  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const user = await repo.findOne({ where: { firebaseUid } });
  if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

  return res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender ?? null,
    profile_completed: user.profileCompleted
  });
});

export default r;
