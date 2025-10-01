import 'reflect-metadata';
import { createTypeORMDataSource } from './infraestructure/config/typeorm.config';
import { configureExpress } from './infraestructure/config/express.config';
import { UserProfileServiceImpl } from './application/services/user-profile.service.impl';
import { UserProfileRepositoryImpl } from './infraestructure/adapters/output/user-profile.repository.impl';
import { UserProfileController } from './infraestructure/adapters/input/user-profile.controller';
import { UserProfile } from './domain/entities/userprofile';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const dataSource = createTypeORMDataSource();
    await dataSource.initialize();

    const userProfileRepository = new UserProfileRepositoryImpl(dataSource.getRepository(UserProfile));
    const userProfileService = new UserProfileServiceImpl(userProfileRepository);
    const userProfileController = new UserProfileController(userProfileService);

    const app = configureExpress(userProfileController);
    const port = process.env.PORT_USER_PROFILES || 3001;
    app.listen(port, () => {
        console.log(`User Profile service is running on port ${port}`);
    });
}

bootstrap().catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
});