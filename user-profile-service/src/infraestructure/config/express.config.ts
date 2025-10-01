import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import { UserProfileController } from '../adapters/input/user-profile.controller';

export function configureExpress(userProfileController: UserProfileController): express.Application {
  const app = express();

  // Middleware para parsear el body de las solicitudes
  app.use(bodyParser.json());

  // Ruta para testear la conexión
  app.get('/test', (req, res) => {
    res.status(200).json({ message: 'User Profile service is running' });
  });
  // En la misma ruta, enviar un mensaje y retornar un estado 200 con el mensaje como respuesta
  app.post('/test', (req, res) => {
    const { message } = req.body;
    res.status(200).json({ message });
  });

  app.get('/user-profiles/:uid', async (req, res) => {
    await userProfileController.getUserProfile(req, res);
  });

  app.put('/user-profiles/:uid', async (req, res) => {
    await userProfileController.updateUserProfile(req, res);
  });

  app.post('/user-profiles', async (req, res) => {
    await userProfileController.createUserProfile(req, res);
  })

  app.delete('/user-profiles/:uid', async (req, res) => {
    await userProfileController.deleteUserProfile(req, res);
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