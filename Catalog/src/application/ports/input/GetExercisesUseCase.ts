import { Exercise } from '../../../domain/entities/Exercise';

export interface ExerciseFilters {
  categoria?: string;
  nivel?: string;
  musculo_principal?: string;
  search?: string;
}

export interface GetExercisesUseCase {
  execute(filters?: ExerciseFilters): Promise<Exercise[]>;
}
