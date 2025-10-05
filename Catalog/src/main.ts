import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createPool, createCatalogTables } from './infrastructure/config/database';
import { PostgresExerciseRepository } from './infrastructure/adapters/output/persistence/PostgresExerciseRepository';
import { PostgresFoodRepository } from './infrastructure/adapters/output/persistence/PostgresFoodRepository';
import { ExerciseService } from './application/services/ExerciseService';
import { FoodService } from './application/services/FoodService';
import { ExerciseController } from './infrastructure/adapters/input/http/controllers/ExerciseController';
import { FoodController } from './infrastructure/adapters/input/http/controllers/FoodController';
import { createCatalogRoutes } from './infrastructure/adapters/input/http/routes/catalogRoutes';

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const pool = createPool();
  
  try {
    await pool.query('SELECT 1');
    await pool.query(createCatalogTables);
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  // Repositories
  const exerciseRepository = new PostgresExerciseRepository(pool);
  const foodRepository = new PostgresFoodRepository(pool);

  // Services
  const exerciseService = new ExerciseService(exerciseRepository);
  const foodService = new FoodService(foodRepository);

  // Controllers
  const exerciseController = new ExerciseController(exerciseService);
  const foodController = new FoodController(foodService);

  // Routes
  app.use('/api/catalog', createCatalogRoutes(exerciseController, foodController));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      service: 'catalog',
      timestamp: new Date() 
    });
  });

  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    console.log(`Catalog Service running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await pool.end();
    process.exit(0);
  });
}

bootstrap().catch(console.error);