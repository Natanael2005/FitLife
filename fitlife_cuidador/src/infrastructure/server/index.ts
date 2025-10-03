import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
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
  app.use(cors());
  app.use(express.json());

  app.get('/ping', (_req, res) => res.json({ ok: true }));

  // 👇 MONTA /api/auth/*
  registerRoutes(app);

  const PORT = Number(process.env.PORT) || 3003;
  app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});