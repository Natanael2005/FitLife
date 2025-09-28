// src/main.ts
import 'dotenv/config';
import { createExpressApp, registerErrorHandler } from './infrastructure/server/ExpressServer.js';
import { env } from './infrastructure/config/env.js';
import { RoutineService } from './application/services/RoutineService.js';
import { RoutineController } from './infrastructure/adapters/input/http/controllers/RoutineController.js';
import { buildRoutineRouter } from './infrastructure/adapters/input/http/routes/routineRoutes.js';

import { pool } from './infrastructure/config/db.js';
import { PostgresRoutineRepository } from './infrastructure/adapters/output/persistence/PostgresRoutineRepository.js';

async function bootstrap() {
  const app = createExpressApp();

  const repo = new PostgresRoutineRepository(pool);   // ✅ Postgres
  const service = new RoutineService(repo);
  const controller = new RoutineController(service);

  app.use('/routines', buildRoutineRouter(controller));

  registerErrorHandler(app);

  app.listen(env.PORT, () => {
    console.log(`Routines service running on port ${env.PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal error on bootstrap', err);
  process.exit(1);
});
