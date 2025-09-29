import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'fitlife_general_stats',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  externalServices: {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3005',
    routineService: process.env.ROUTINE_SERVICE_URL || 'http://localhost:3006',
    historyService: process.env.HISTORY_SERVICE_URL || 'http://localhost:3002'
  }
};
