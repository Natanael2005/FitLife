import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT || 3001),
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const;
