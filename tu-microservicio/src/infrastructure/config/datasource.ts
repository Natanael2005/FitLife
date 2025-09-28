import { DataSource } from 'typeorm';
import { User } from '../adapters/output/persistence/entities/User';

let ds: DataSource | null = null;

export async function getDataSource() {
  if (ds && ds.isInitialized) return ds;
  ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'fitlife',
    entities: [User],
    synchronize: false, // usa migraciones en proyecto real; en dev puedes poner true
    logging: false
  });
  if (!ds.isInitialized) await ds.initialize();
  return ds;
}
