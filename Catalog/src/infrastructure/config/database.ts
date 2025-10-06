import { Pool } from 'pg';

export const createPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME || 'fitlife_catalogo',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

export const createCatalogTables = `
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL,
    nivel TEXT[] NOT NULL,
    contraindicaciones TEXT[],
    series_recomendadas INTEGER,
    repeticiones_recomendadas INTEGER,
    calorias_por_minuto DECIMAL(5,2) DEFAULT 0,
    musculo_principal TEXT,
    musculo_secundario TEXT,
    equipo_necesario TEXT[],
    gif_url TEXT,
    imagen_url TEXT,
    video_url TEXT,
    instrucciones TEXT[],
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS foods (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    imagen TEXT,
    alergenos TEXT[] NOT NULL,
    calorias DECIMAL(7,2) NOT NULL,
    proteinas DECIMAL(5,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_exercises_categoria ON exercises(categoria);
CREATE INDEX IF NOT EXISTS idx_exercises_nivel ON exercises(nivel);
  CREATE INDEX IF NOT EXISTS idx_exercises_activo ON exercises(activo);
  CREATE INDEX IF NOT EXISTS idx_foods_categoria ON foods(categoria);
  CREATE INDEX IF NOT EXISTS idx_foods_alergenos ON foods USING GIN(alergenos);
  CREATE INDEX IF NOT EXISTS idx_foods_activo ON foods(activo);
`;
