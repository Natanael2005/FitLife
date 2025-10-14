import { Router } from 'express';
import { RoutineController } from '../controllers/RoutineController.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

export const routineRoutes = (controller: RoutineController) => {
  const r = Router();

  // Privadas
  r.post('/rutinas', controller.create);
  r.get('/rutinas', controller.listByUser); // ?usuarioId=
  r.get('/rutinas/:id/', controller.get);     // ?usuarioId=
  r.patch('/rutinas/:id', controller.update);// ?usuarioId=
  r.delete('/rutinas/:id', controller.remove);// ?usuarioId=

  // Públicas (lectura)
  r.get('/rutinas-default', controller.listPublic);
  r.get('/rutinas-default/:id', controller.getPublic);

  // Clonado
  r.post('/rutinas/desde-default/:defaultId', controller.cloneFromPublic);

  // Admin (protegidas por API key)
  r.post('/admin/rutinas-default', requireAdmin, controller.createPublic);
  r.patch('/admin/rutinas-default/:id', requireAdmin, controller.updatePublic);
  r.delete('/admin/rutinas-default/:id', requireAdmin, controller.deletePublic);

  return r;
};
