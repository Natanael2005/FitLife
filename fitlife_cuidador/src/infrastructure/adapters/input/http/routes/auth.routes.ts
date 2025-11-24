import { Router } from 'express';
import { z } from 'zod';
import { getDataSource } from '../../../../config/datasource';
import { FirebaseAuthProviderAdapter } from '../../../output/external/FirebaseAuthProviderAdapter';
import { UserRepositoryAdapter } from '../../../output/persistence/UserRepositoryAdapter';
import { AuthService } from '../../../../../application/services/AuthService';
import { firebaseAuth } from '../middlewares/firebaseAuth';

const r = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['masculino','femenino','otro']).optional(),
  returnSecureToken: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  returnSecureToken: z.boolean().optional(),
});

const paramsId = z.object({ id: z.string().uuid() });

async function svc() {
  const ds = await getDataSource();
  return new AuthService(
    new FirebaseAuthProviderAdapter(),
    new UserRepositoryAdapter(ds)
  );
}

/* --------- POST /api/auth/register --------- */
r.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const out = await (await svc()).register(body);
    return res.status(201).json(out);
  } catch (e: any) {
    const status = e?.status ?? (e?.message === 'MISSING_API_KEY' ? 500 : 400);
    return res.status(status).json({ error: 'REGISTER_ERROR', message: e?.message || 'Error' });
  }
});

/* --------- POST /api/auth/login --------- */
r.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const out = await (await svc()).login(body);
    return res.json(out);
  } catch (e: any) {
    const status = e?.status ?? (e?.message === 'MISSING_API_KEY' ? 500 : 400);
    return res.status(status).json({ error: 'LOGIN_ERROR', message: e?.message || 'Error' });
  }
});

/* --------- ⬅️ NUEVO: GET /api/auth/public/user/:id (sin Bearer) --------- */
r.get('/public/user/:id', async (req, res) => {
  try {
    const { id } = paramsId.parse(req.params);
    const out = await (await svc()).profileById(id);
    return res.json(out);
  } catch (e: any) {
    return res.status(e?.message === 'NOT_FOUND' ? 404 : 400).json({ error: e?.message || 'ERROR' });
  }
});

export default r;
