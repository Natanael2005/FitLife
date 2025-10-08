export type Nivel = 'BAJO' | 'INTERMEDIO' | 'AVANZADO';

export type CatalogExercise = {
  id: string;
  slug: string;                // UPPER (no se usa en reglas, pero lo dejamos UPPER)
  nombre: string;
  categoria?: string | null;
  contraindicaciones: string[]; // UPPER
  nivel: Nivel;
  series_recomendadas?: number | null;
  repeticiones_recomendadas?: number | null;
  gifUrl?: string | null;
  musculo_principal?: string | null;
  musculo_secundario?: string | null;
  instrucciones?: string[];    // array de pasos
  activo?: boolean;        // (no se usa en reglas, pero lo dejamos)
};

export type CatalogFood = {
  isActive: any;
  id: string;
  slug: string;                // UPPER
  nombre: string;
  categoria?: string | null;
  alergenos: string[];         // UPPER
  imagen?: string | null;
  calorias: number | null;
  proteinas: number | null;
  activo?: boolean;        // (no se usa en reglas, pero lo dejamos)
};

export type CatalogRoutine = {
  id: string;
  slug: string;                // (no se usa en reglas)
  nombre: string;
  dias: string[];
  ejercicios: CatalogExercise[];
  alimentos: CatalogFood[];
};

export interface CatalogQueryPort {
  getAllExercises(): Promise<CatalogExercise[]>;
  getAllFoods(): Promise<CatalogFood[]>;
  getAllPublicRoutinesExpanded(): Promise<CatalogRoutine[]>;
}