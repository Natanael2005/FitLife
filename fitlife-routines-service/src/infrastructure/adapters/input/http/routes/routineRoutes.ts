import { Router } from 'express';
import { RoutineController } from '../controllers/RoutineController.js';

export const routineRoutes = (controller: RoutineController) => {
  const r = Router();

  // Privadas
  r.post('/rutinas', controller.create);
  r.get('/rutinas', controller.listByUser); // ?usuarioId=
  r.get('/rutinas/:id', controller.get);
  r.patch('/rutinas/:id', controller.update);
  r.delete('/rutinas/:id', controller.remove);

  // Públicas
  r.get('/rutinas-default', controller.listPublic);
  r.get('/rutinas-default/:id', controller.getPublic);

  // Clonado
  r.post('/rutinas/desde-default/:defaultId', controller.cloneFromPublic);

  return r;
};
