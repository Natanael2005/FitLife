import { Pool } from 'pg';

export const createPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fitlife_manager_rutinas',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

export const createUserRoutinesTable = `
  CREATE TABLE IF NOT EXISTS routine_assignments (
    id SERIAL PRIMARY KEY,
    usuario_id VARCHAR(255) NOT NULL,
    rutina_id VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, rutina_id)
  );

  CREATE INDEX IF NOT EXISTS idx_routine_assignments_usuario_id ON routine_assignments(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_routine_assignments_rutina_id ON routine_assignments(rutina_id);
  CREATE INDEX IF NOT EXISTS idx_routine_assignments_active ON routine_assignments(is_active);
`;