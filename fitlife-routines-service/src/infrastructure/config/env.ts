import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT || 3001),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  ADMIN_KEY: process.env.ADMIN_KEY || 'super-secreta'
} as const;
