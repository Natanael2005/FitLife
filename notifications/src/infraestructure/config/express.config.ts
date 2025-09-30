import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { NotificationController } from '../adapters/input/notification.controller';
import { swaggerSpec } from './swagger.config';

export function configureExpress(notificationController: NotificationController): express.Application {
  const app = express();

  // Middleware para parsear el body de las solicitudes
  app.use(bodyParser.json());

  // Ruta para crear una notificación
  app.post('/notifications', async (req, res) => {
    await notificationController.createNotification(req, res);
  });

  // Ruta para enviar notificaciones programadas (puedes ajustarla según tus necesidades)
  app.post('/notifications/send', async (req, res) => {
    await notificationController.sendNotifications(req, res);
  });

  // Middleware para manejar errores
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

    // Configuración de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
}