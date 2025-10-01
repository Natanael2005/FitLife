import { Pool } from 'pg';

export const createPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fitlife_history',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};


export const createWorkoutHistoryTable = `
  CREATE TABLE IF NOT EXISTS workout_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    routine_name VARCHAR(255) NOT NULL,
    routine_id VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_workout_history_completed_at ON workout_history(completed_at);
`;
