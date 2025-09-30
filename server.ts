import 'reflect-metadata';
import { createTypeORMDataSource } from './notifications/src/infraestructure/config/typeorm.config';
import { configureExpress } from './notifications/src/infraestructure/config/express.config';
import { NotificationServiceImpl } from './notifications/src/application/services/notification.service.impl';
import { NotificationRepositoryImpl } from './notifications/src/infraestructure/adapters/output/notification.repository.impl';
import { NotificationController } from './notifications/src/infraestructure/adapters/input/notification.controller';
import { Notification } from './notifications/src/domain/entities/notification';

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