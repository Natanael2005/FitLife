import { Exercise } from '../../../domain/entities/Exercise';

export interface CreateExerciseDto {
  nombre: string;
  categoria: string;
  contraindicaciones: string[];
  nivel: string[];
  series_recomendadas: number;
  repeticiones_recomendadas: number;
  gifUrl?: string;
  musculo_principal: string;
  musculo_secundario: string;
  instrucciones?: string[];
}

export interface CreateExerciseUseCase {
  execute(dto: CreateExerciseDto): Promise<Exercise>;
}
