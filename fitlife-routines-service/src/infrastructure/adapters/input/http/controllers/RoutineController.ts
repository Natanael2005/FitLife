import { Request, Response } from 'express';
import { RoutineService } from '../../../../../application/services/RoutineService.js';
import { HttpStatus } from '../../../../../shared/constants/HttpStatus.js';

export class RoutineController {
  constructor(private readonly service: RoutineService) {}

  create = async (req: Request, res: Response) => {
    const routine = await this.service.create({
      userId: req.body.userId,
      name: req.body.name,
      description: req.body.description,
      days: req.body.days,
      exercises: req.body.exercises,
      foods: req.body.foods,
      isPublic: req.body.isPublic
    });
    return res.status(HttpStatus.CREATED).json(routine.toJSON());
  };

  getById = async (req: Request, res: Response) => {
    const routine = await this.service.getById(req.params.id);
    return res.status(HttpStatus.OK).json(routine.toJSON());
  };

  getByUser = async (req: Request, res: Response) => {
    const routines = await this.service.getByUser(req.params.userId);
    return res.status(HttpStatus.OK).json(routines.map(r => r.toJSON()));
  };

  update = async (req: Request, res: Response) => {
    const routine = await this.service.update({
      routineId: req.params.id,
      userId: req.body.userId, // en producción vendrá del token
      name: req.body.name,
      description: req.body.description,
      days: req.body.days,
      exercises: req.body.exercises,
      foods: req.body.foods,
      isPublic: req.body.isPublic,
      isActive: req.body.isActive
    });
    return res.status(HttpStatus.OK).json(routine.toJSON());
  };

  delete = async (req: Request, res: Response) => {
    await this.service.delete({ routineId: req.params.id, userId: req.body.userId });
    return res.status(HttpStatus.NO_CONTENT).send();
  };
}
