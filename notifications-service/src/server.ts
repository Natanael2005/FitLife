import 'reflect-metadata';
import { createTypeORMDataSource } from './infraestructure/config/typeorm.config';
import { configureExpress } from './infraestructure/config/express.config';
import { NotificationServiceImpl } from './application/services/notification.service.impl';
import { NotificationRepositoryImpl } from './infraestructure/adapters/output/notification.repository.impl';
import { NotificationController } from './infraestructure/adapters/input/notification.controller';
import { Notification } from './domain/entities/notification';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const dataSource = createTypeORMDataSource();
  await dataSource.initialize();

  const notificationRepository = new NotificationRepositoryImpl(dataSource.getRepository(Notification));
  const notificationService = new NotificationServiceImpl(notificationRepository);
  const notificationController = new NotificationController(notificationService);

  const app = configureExpress(notificationController);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Notification service is running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error starting the server:', error);
  process.exit(1);
});