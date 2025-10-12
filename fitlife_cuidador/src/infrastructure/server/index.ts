import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { httpLogger, logger } from '../config/logger';   // ya lo tienes
import dotenv from 'dotenv';
import { getDataSource } from '../config/datasource';
import { seedCatalogs } from '../config/seedCatalogs';
import { registerRoutes } from '../adapters/input/http/routes';

dotenv.config();

async function main() {
  try {
    await getDataSource();
    await seedCatalogs(await getDataSource());
    console.log('✅ DB conectada');
  } catch (e) {
    console.error('❌ No se pudo conectar a la DB:', (e as Error).message);
    process.exit(1);
  }

  const app = express();

  app.set('trust proxy', true);  
  app.use(httpLogger);            

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
    exposedHeaders: ['x-request-id'],
  }));
  app.use(express.json());

  app.get('/ping', (_req, res) => res.json({ ok: true }));

  registerRoutes(app);

  const PORT = Number(process.env.PORT) || 3003;
  app.listen(PORT, () => logger.info(`API en http://localhost:${PORT}`));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
