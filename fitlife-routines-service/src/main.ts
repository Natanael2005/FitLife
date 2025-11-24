import { env } from './infrastructure/config/env.js';
import { buildServer } from './infrastructure/server/ExpressServer.js';

const app = buildServer();
app.listen(env.PORT, () => {
  console.log(`✅ Routines service running on http://localhost:${env.PORT}`);
});
