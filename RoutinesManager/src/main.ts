import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createPool, createUserRoutinesTable } from './infrastructure/config/database';
import { PostgresUserRoutineRepository } from './infrastructure/adapters/output/persistence/PostgresUserRoutineRepository';
import { HttpRoutineServiceClient } from './infrastructure/adapters/output/http/HttpRoutineServiceClient';
import { RoutineManagerService } from './application/services/RoutineManagerService';
import { RoutineManagerController } from './infrastructure/adapters/input/http/controllers/RoutineManagerController';
import { createManagerRoutes } from './infrastructure/adapters/input/http/routes/managerRoutes';

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  
  try {
    await pool.query('SELECT 1');
    await pool.query(createUserRoutinesTable);
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const routineServiceUrl = process.env.ROUTINE_SERVICE_URL || 'http://localhost:3002';
  
  const userRoutineRepository = new PostgresUserRoutineRepository(pool);
  const routineServiceClient = new HttpRoutineServiceClient(routineServiceUrl);
  const routineManagerService = new RoutineManagerService(
    userRoutineRepository,
    routineServiceClient
  );
  
  const controller = new RoutineManagerController(routineManagerService);

  app.use('/api/manager', createManagerRoutes(controller));

  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      service: 'routine-manager',
      timestamp: new Date() 
    });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Routine Manager Service running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
  });
}

bootstrap().catch(console.error);