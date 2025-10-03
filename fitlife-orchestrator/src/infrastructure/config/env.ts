import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  ROUTINES_URL: z.string().url(),
  CARETAKER_URL: z.string().url(),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  RETRY_ATTEMPTS: z.coerce.number().int().min(0).default(2),
});

// Esta variable 'env' es la que importaremos en todo el proyecto.
// Si falta una variable o es incorrecta, la aplicación fallará al arrancar.
export const env = envSchema.parse(process.env);