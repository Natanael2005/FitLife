import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './infrastructure/config/env';
import { createPool, createActivitiesTable, createWorkoutSessionsTable } from './infrastructure/config/database';
import { PostgresActivityRepository } from './infrastructure/adapters/output/persistence/PostgresActivityRepository';
import { StatsServiceImpl } from './infrastructure/adapters/output/external/StatsServiceImpl';
import { HistoryService } from './application/services/HistoryService';
import { HistoryController } from './infrastructure/adapters/input/http/controllers/HistoryController';
import { createHistoryRoutes } from './infrastructure/adapters/input/http/routes/historyRoutes';

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  
  try {
    await pool.query('SELECT 1');
    await pool.query(createActivitiesTable);
    await pool.query(createWorkoutSessionsTable);
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const statsService = new StatsServiceImpl(config.externalServices.userStatsService || 'http://localhost:3001');

  const activityRepository = new PostgresActivityRepository(pool);
  const historyService = new HistoryService(activityRepository, statsService);
  const historyController = new HistoryController(historyService, historyService);

  app.use('/api/history', createHistoryRoutes(historyController));

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'history', timestamp: new Date() });
  });

  app.listen(config.port, () => {
    console.log(`History Service running on port ${config.port}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
  });
}

bootstrap().catch(console.error);
