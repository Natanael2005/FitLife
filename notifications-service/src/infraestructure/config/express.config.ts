import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { NotificationController } from '../adapters/input/notification.controller';
import { swaggerSpec } from './swagger.config';

export function configureExpress(notificationController: NotificationController): express.Application {
  const app = express();

  // Middleware para parsear el body de las solicitudes
  app.use(bodyParser.json());

  // Ruta para testear la conexión
  app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Notification service is running' });
  });
  // En la misma ruta, enviar un mensaje y retornar un estado 200 con el mensaje como respuesta
  app.post('/test', (req, res) => {
    const { message } = req.body;
    res.status(200).json({ message });
  })

  /**
     * @swagger
     * /notifications:
     *   post:
     *     summary: Create a new notification
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateNotificationDto'
     *     responses:
     *       201:
     *         description: Notification created successfully
     *       400:
     *         description: Invalid request body
     */
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