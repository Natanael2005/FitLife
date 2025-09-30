import type { Request, Response, NextFunction } from 'express';
import { RoutineService } from '../../../../../application/services/RoutineService.js';
import { RoutineNotFound } from '../../../../../domain/exceptions/RoutineNotFound.js';
import { UnauthorizedAccess } from '../../../../../domain/exceptions/UnauthorizedAccess.js';
import { InvalidRoutineData } from '../../../../../domain/exceptions/InvalidRoutineData.js';

export class RoutineController {
  constructor(private service: RoutineService) {}

  // ===== Privadas =====
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await this.service.createUserRoutine(req.body);
      res.status(201).json(out);
    } catch (e) { next(e); }
  };

  listByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = String(req.query.usuarioId || '');
      const out = await this.service.listUserRoutines(usuarioId);
      res.json(out);
    } catch (e) { next(e); }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const usuarioId = String(req.query.usuarioId || '');
      const out = await this.service.getUserRoutine(id, usuarioId);
      res.json(out);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const usuarioId = String(req.query.usuarioId || '');
      const out = await this.service.updateUserRoutine(id, usuarioId, req.body);
      res.json(out);
    } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const usuarioId = String(req.query.usuarioId || '');
      await this.service.deleteUserRoutine(id, usuarioId);
      res.status(204).end();
    } catch (e) { next(e); }
  };

  // ===== Públicas (lectura + clon) =====
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
      const out = await this.service.cloneFromPublic(defaultId, usuario_id, { nombre, dias });
      res.status(201).json(out);
    } catch (e) { next(e); }
  };

  // ===== Admin (CRUD públicas) =====
  createPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await this.service.createPublic(req.body);
      res.status(201).json(out);
    } catch (e) { next(e); }
  };

  updatePublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await this.service.updatePublic(req.params.id, req.body);
      if (!out) return res.status(404).json({ error: 'No encontrada' });
      res.json(out);
    } catch (e) { next(e); }
  };

  deletePublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deletePublic(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  };
}
