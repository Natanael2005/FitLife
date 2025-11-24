import { ExerciseRepository } from '../ports/output/ExerciseRepository';
import { Exercise } from '../../domain/entities/Exercise';
import { ExerciseFilters } from '../ports/input/GetExercisesUseCase';
import { CreateExerciseDto } from '../ports/input/CreateExerciseUseCase';
import { ExerciseNotFound, DuplicateEntry } from '../../domain/exceptions/CatalogExceptions';

export class ExerciseService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    return await this.exerciseRepository.findAll(filters);
  }

  async createExercise(dto: CreateExerciseDto): Promise<Exercise> {
    const existing = await this.exerciseRepository.findByNombre(dto.nombre);
    if (existing) {
      throw new DuplicateEntry(`Exercise '${dto.nombre}' already exists`);
    }

    const id = `ejer-${Date.now()}`;
    const exercise = new Exercise(
      id,
      dto.nombre,
      dto.categoria,
      dto.contraindicaciones,
      dto.nivel,
      dto.series_recomendadas,
      dto.repeticiones_recomendadas,
      dto.gifUrl || '',
      dto.musculo_principal,
      dto.musculo_secundario,
      dto.instrucciones || [],
      true,
      new Date()
    );

    return await this.exerciseRepository.save(exercise);
  }

  async getExerciseById(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findById(id);
    if (!exercise) {
      throw new ExerciseNotFound(`Exercise ${id} not found`);
    }
    return exercise;
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const existing = await this.exerciseRepository.findById(id);
    if (!existing) {
      throw new ExerciseNotFound(`Exercise ${id} not found`);
    }

    return await this.exerciseRepository.update(id, updates);
  }

  async deleteExercise(id: string): Promise<void> {
    const existing = await this.exerciseRepository.findById(id);
    if (!existing) {
      throw new ExerciseNotFound(`Exercise ${id} not found`);
    }

    await this.exerciseRepository.delete(id);
  }
}
