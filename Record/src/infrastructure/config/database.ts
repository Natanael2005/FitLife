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

export const createActivitiesTable = `
  CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('workout', 'nutrition', 'custom')),
    name VARCHAR(255) NOT NULL,
    duration DECIMAL(8,2) NOT NULL,
    calories_burned DECIMAL(8,2) NOT NULL,
    date TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
  CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
  CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
  CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date);
`;

export const createWorkoutSessionsTable = `
  CREATE TABLE IF NOT EXISTS workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    routine_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_calories_burned DECIMAL(8,2) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    exercises JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sessions_routine_id ON workout_sessions(routine_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sessions_start_time ON workout_sessions(start_time);
`;
