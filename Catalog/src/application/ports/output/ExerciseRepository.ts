import { Exercise } from '../../../domain/entities/Exercise';
import { ExerciseFilters } from '../../ports/input/GetExercisesUseCase';

export interface ExerciseRepository {
  findAll(filters?: ExerciseFilters): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
  findByNombre(nombre: string): Promise<Exercise | null>;
  save(exercise: Omit<Exercise, 'isActive' | 'createdAt'>): Promise<Exercise>;
  update(id: string, exercise: Partial<Exercise>): Promise<Exercise>;
  delete(id: string): Promise<void>;
}
