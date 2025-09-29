import { Pool } from 'pg';

export const createPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fitlife_user_stats',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

export const createUserStatsTable = `
  CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    target_weight DECIMAL(5,2) NOT NULL,
    current_height DECIMAL(5,2) NOT NULL,
    workout_streak INTEGER DEFAULT 0,
    total_workouts INTEGER DEFAULT 0,
    total_calories_burned DECIMAL(10,2) DEFAULT 0,
    average_workout_duration DECIMAL(5,2) DEFAULT 0,
    bmi DECIMAL(4,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weekly_goal_progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_stats_last_updated ON user_stats(last_updated);
`;
