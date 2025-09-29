import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './infrastructure/config/env';
import { createPool, createSystemStatsTable } from './infrastructure/config/database';
import { PostgresSystemStatsRepository } from './infrastructure/adapters/output/persistence/PostgresSystemStatsRepository';
import { GeneralStatsService } from './application/services/GeneralStatsService';
import { GeneralStatsController } from './infrastructure/adapters/input/http/controllers/GeneralStatsController';
import { createGeneralStatsRoutes } from './infrastructure/adapters/input/http/routes/generalStatsRoutes';

class MockUserRepository {
  async getTotalUserCount(): Promise<number> { return 500; }
  async getActiveUserCount(): Promise<number> { return 350; }
  async getTotalWorkoutCount(): Promise<number> { return 2500; }
  async getUserDemographics(): Promise<any> { return {}; }
}

class MockRoutineRepository {
  async getPopularRoutines(limit: number): Promise<any[]> { return []; }
}

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  
  try {
    await pool.query('SELECT 1');
    await pool.query(createSystemStatsTable);
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const systemStatsRepository = new PostgresSystemStatsRepository(pool);
  const userRepository = new MockUserRepository();
  const routineRepository = new MockRoutineRepository(); 
  const generalStatsService = new GeneralStatsService(
    systemStatsRepository,
    userRepository,
    routineRepository
  );
  
  const generalStatsController = new GeneralStatsController(
    generalStatsService,
    generalStatsService
  );

  app.use('/api/general-stats', createGeneralStatsRoutes(generalStatsController));

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'general-stats', timestamp: new Date() });
  });

  app.listen(config.port, () => {
    console.log(`General Stats Service running on port ${config.port}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
  });
}

bootstrap().catch(console.error);
