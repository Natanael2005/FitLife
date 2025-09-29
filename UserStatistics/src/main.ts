import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './infrastructure/config/env';
import { createPool, createUserStatsTable } from './infrastructure/config/database';
import { PostgresUserStatsRepository } from './infrastructure/adapters/output/persistence/PostgresUserStatsRepository';
import { UserStatsService } from './application/services/UserStatsService';
import { UserStatsController } from './infrastructure/adapters/input/http/controllers/UserStatsController';
import { createStatsRoutes } from './infrastructure/adapters/input/http/routes/statsRoutes';

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  
  try {
    await pool.query('SELECT 1');
    await pool.query(createUserStatsTable);
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const userStatsRepository = new PostgresUserStatsRepository(pool);
  const userStatsService = new UserStatsService(userStatsRepository);
  const userStatsController = new UserStatsController(userStatsService);

  app.use('/api/stats', createStatsRoutes(userStatsController));

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'user-stats', timestamp: new Date() });
  });

  app.listen(config.port, () => {
    console.log(`User Stats Service running on port ${config.port}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
  });
}

bootstrap().catch(console.error);
