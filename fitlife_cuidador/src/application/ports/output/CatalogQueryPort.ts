export type Nivel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export type CatalogExercise = {
  id: string;
  slug: string;                // UPPER (no se usa en reglas, pero lo dejamos UPPER)
  nombre: string;
  categoria?: string | null;
  contraindicaciones: string[]; // UPPER
  nivel: Nivel;
  series_recomendadas?: number | null;
  repeticiones_recomendadas?: number | null;
};

export type CatalogFood = {
  id: string;
  slug: string;                // UPPER
  nombre: string;
  categoria?: string | null;
  alergenos: string[];         // UPPER
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