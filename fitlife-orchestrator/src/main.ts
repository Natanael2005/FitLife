import { env } from './infrastructure/config/env.js';
import { createExpressApp } from './infrastructure/config/express.js';
import { OrchestratorServiceImpl } from './application/services/orchestrator.service.impl.js';
import { CaretakerClientImpl } from './infrastructure/adapters/output/http/caretaker.client.impl.js';
import { RoutinesClientImpl } from './infrastructure/adapters/output/http/routines.client.impl.js';

function bootstrap() {
  // 1. Inicializar Clientes (solo los que necesitamos)
  const caretakerClient = new CaretakerClientImpl();
  const routinesClient = new RoutinesClientImpl();

  // 2. Inicializar Servicio de Aplicación (sin el webhook)
  const orchestratorService = new OrchestratorServiceImpl(
    caretakerClient,
    routinesClient
  );

  // 3. Inicializar App Express
  const app = createExpressApp(orchestratorService);

  // 4. Iniciar el Servidor
  app.listen(env.PORT, () => {
    console.log(`🚀 Orquestador escuchando en el puerto ${env.PORT}`);
  });
}

bootstrap();