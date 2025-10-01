import { DataSource } from 'typeorm';
import { UserProfile } from '../../domain/entities/userprofile';
import * as dotenv from 'dotenv'

dotenv.config();

export const createTypeORMDataSource = (): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities: [UserProfile],
    synchronize: true,
  });
};