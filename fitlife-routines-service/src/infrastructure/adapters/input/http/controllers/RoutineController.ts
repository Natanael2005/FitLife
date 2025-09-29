import type { Request, Response, NextFunction } from 'express';
import { RoutineService } from '../../../../../application/services/RoutineService.js';
import { RoutineNotFound } from '../../../../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../../../../domain/exceptions/UnauthorizedAccess.js';

export class RoutineController {
  constructor(private service: RoutineService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await this.service.execute(req.body);
      res.status(201).json(out);
    } catch (e) { next(e); }
  };

  listByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = String(req.query.usuarioId || '');
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido' });
      const out = await this.service.execute(usuarioId);
      res.json(out);
    } catch (e) { next(e); }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const usuarioId = String(req.query.usuarioId || '');
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido' });
      const out = await this.service.execute(id, usuarioId);
      res.json(out);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const usuarioId = String(req.query.usuarioId || '');
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido' });
      const out = await this.service.execute(id, usuarioId, req.body);
      res.json(out);
    } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const usuarioId = String(req.query.usuarioId || '');
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido' });
      await this.service.delete(id, usuarioId);
      res.status(204).end();
    } catch (e) { next(e); }
  };

  listPublic = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await this.service.listPublic();
      res.json(out);
    } catch (e) { next(e); }
  };

  getPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await this.service.getPublic(req.params.id);
      if (!out) return res.status(404).json({ error: 'No encontrada' });
      res.json(out);
    } catch (e) { next(e); }
  };

  cloneFromPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { defaultId } = req.params;
      const { usuario_id, nombre, dias } = req.body || {};
      if (!usuario_id) return res.status(400).json({ error: 'usuario_id requerido' });
      const out = await this.service.cloneFromPublic(defaultId, usuario_id, { nombre, dias });
      res.status(201).json(out);
    } catch (e) { next(e); }
  };
}
