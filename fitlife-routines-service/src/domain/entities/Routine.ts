import type { ExerciseSnapshot } from './Exercise.js';
import type { FoodSnapshot } from './Food.js';

export interface UserRoutine {
  id: string;
  usuario_id: string;
  nombre: string;
  dias: string[];
  ejercicios: ExerciseSnapshot[];
  alimentos: FoodSnapshot[];
}

export interface PublicRoutine {
  id: string;
  nombre: string;
  descripcion?: string;
  dias: string[];
  ejercicios: ExerciseSnapshot[];
  alimentos: FoodSnapshot[];
  publicada: boolean;
  version: number;
}
