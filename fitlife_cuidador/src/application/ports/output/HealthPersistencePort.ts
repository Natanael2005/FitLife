import { CategoriaIMC, Nivel } from "../../../domain/entities/UserHealthData";

export type HealthSnapshot = {
  userId: string;
  pesoKg: number | null;
  estaturaCm: number | null;
  nivel: Nivel | null;                 // 'BAJO' | 'INTERMEDIO' | 'AVANZADO'
  imc: number | null;
  categoria_imc: CategoriaIMC | null;
  alergias: Array<{ slug: string; nombre?: string }>;
  condiciones: Array<{ slug: string; nombre?: string }>;
};

export interface HealthPersistencePort {
  // Identidad
  findUserById(userId: string): Promise<{ id: string; firebaseUid: string | null } | null>;

  // Lectura
  readHealth(userId: string): Promise<{
    pesoKg: number | null;
    estaturaCm: number | null;
    nivel: Nivel | null;
    imcStr: string | null;
    categoria: CategoriaIMC | null;
  } | null>;
  listAllergiesByUser(userId: string): Promise<Array<{ slug: string; nombre?: string }>>;
  listConditionsByUser(userId: string): Promise<Array<{ slug: string; nombre?: string }>>;

  // Escritura (patch)
  upsertHealth(userId: string, patch: {
    pesoKg?: number | null;
    estaturaCm?: number | null;
    nivel?: Nivel | null;
    imc?: number | null;
    categoria_imc?: CategoriaIMC | null;
  }): Promise<void>;

  // Links por SLUG
  replaceAllergiesBySlugs(userId: string, slugs: string[]): Promise<void>;
  replaceConditionsBySlugs(userId: string, slugs: string[]): Promise<void>;
}
