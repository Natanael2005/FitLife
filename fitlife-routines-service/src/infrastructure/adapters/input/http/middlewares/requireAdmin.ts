import type { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.header('x-admin-key') || '';
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_KEY no configurada' });
  }
  if (key !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
