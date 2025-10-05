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

// export const createUserRoutinesTable = `
//   CREATE TABLE IF NOT EXISTS user_routines (
//     id SERIAL PRIMARY KEY,
//     usuario_id VARCHAR(255) NOT NULL,
//     rutina_id VARCHAR(255) NOT NULL,
//     assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_active BOOLEAN DEFAULT true,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     UNIQUE(usuario_id, routina_id)
//   );

//   CREATE INDEX IF NOT EXISTS idx_user_routines_usuario_id ON user_routines(usuario_id);
//   CREATE INDEX IF NOT EXISTS idx_user_routines_rutina_id ON user_routines(rutina_id);
//   CREATE INDEX IF NOT EXISTS idx_user_routines_active ON user_routines(is_active);
// `;
