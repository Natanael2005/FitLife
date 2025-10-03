import { Request, Response } from 'express';
import { RoutineManagerService } from '../../../../../application/services/RoutineManagerService';

export class RoutineManagerController {
  constructor(
    private readonly routineManagerService: RoutineManagerService
  ) {}

  async assignRoutine(req: Request, res: Response): Promise<void> {
    try {
      const { userId, routineId } = req.body;

      if (!userId || !routineId) {
        res.status(400).json({ error: 'userId and routineId are required' });
        return;
      }

      const userRoutine = await this.routineManagerService.assignRoutine(userId, routineId);
      res.status(201).json(userRoutine);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserRoutines(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userRoutines = await this.routineManagerService.getUserRoutines(userId);
      res.json(userRoutines);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getUserRoutinesWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const routinesWithDetails = await this.routineManagerService.getUserRoutinesWithDetails(userId);
      res.json(routinesWithDetails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeRoutine(req: Request, res: Response): Promise<void> {
    try {
      const { userId, routineId } = req.params;
      await this.routineManagerService.removeRoutine(userId, routineId);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}