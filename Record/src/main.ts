import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createPool, createWorkoutHistoryTable } from './infrastructure/config/database';
import { PostgresWorkoutHistoryRepository } from './infrastructure/adapters/output/persistence/PostgresWorkoutHistoryRepository';
import { WorkoutHistoryService } from './application/services/WorkoutHistoryService';
import { WorkoutHistoryController } from './infrastructure/adapters/input/http/controllers/WorkoutHistoryController';
import { createHistoryRoutes } from './infrastructure/adapters/input/http/routes/historyRoutes';

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  
  try {
    await pool.query('SELECT 1');
    await pool.query(createWorkoutHistoryTable);
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const historyRepository = new PostgresWorkoutHistoryRepository(pool);
  const historyService = new WorkoutHistoryService(historyRepository);
  const historyController = new WorkoutHistoryController(historyService);

  app.use('/api/history', createHistoryRoutes(historyController));

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'workout-history', timestamp: new Date() });
  });

  const PORT = process.env.PORT || 3004;
  app.listen(PORT, () => {
    console.log(`Workout History Service running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
  });
}

bootstrap().catch(console.error);
