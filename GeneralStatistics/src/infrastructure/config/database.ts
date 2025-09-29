import { Pool } from 'pg';

export const createPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fitlife_general_stats',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

export const createSystemStatsTable = `
  CREATE TABLE IF NOT EXISTS system_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER NOT NULL,
    active_users INTEGER NOT NULL,
    total_workouts INTEGER NOT NULL,
    total_calories_burned DECIMAL(12,2) NOT NULL,
    average_session_time DECIMAL(8,2) NOT NULL,
    popular_routines JSONB DEFAULT '[]',
    user_demographics JSONB DEFAULT '{}',
    engagement_metrics JSONB DEFAULT '{}',
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_system_stats_timestamp ON system_stats(timestamp);
`;
