import { Request, Response } from 'express';
import { RoutineManagerService } from '../../../../../application/services/RoutineManagerService';

export class RoutineManagerController {
  constructor(
    private readonly routineManagerService: RoutineManagerService
  ) {}

  async assignRoutine(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id, rutina_id } = req.body;

      if (!usuario_id || !rutina_id) {
        res.status(400).json({ error: 'usuario_id and rutina_id are required' });
        return;
      }

      const userRoutine = await this.routineManagerService.assignRoutine(usuario_id, rutina_id);
      res.status(200).json(userRoutine);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserRoutines(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id } = req.params;
      const userRoutines = await this.routineManagerService.getUserRoutines(usuario_id);
      res.json(userRoutines);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getUserRoutinesWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id } = req.params;
      const routinesWithDetails = await this.routineManagerService.getUserRoutinesWithDetails(usuario_id);
      res.json(routinesWithDetails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeRoutine(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id, rutina_id } = req.params;
      await this.routineManagerService.removeRoutine(usuario_id, rutina_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}