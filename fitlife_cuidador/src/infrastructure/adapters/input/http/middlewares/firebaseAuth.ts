import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../../../../config/firebase';

export async function firebaseAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'AUTH_REQUIRED' });
  const token = h.slice(7);
  try {
    const decoded = await getFirebaseAdmin().auth().verifyIdToken(token);
    (req as any).user = { firebaseUid: decoded.uid, email: decoded.email ?? '' };
    next();
  } catch (err) {
    console.error('verifyIdToken error:', (err as Error).message);
    return res.status(401).json({ error: 'INVALID_TOKEN', message: (err as Error).message });
  }
}