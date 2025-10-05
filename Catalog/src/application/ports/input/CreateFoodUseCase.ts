import { Food } from '../../../domain/entities/Food';

export interface CreateFoodDto {
  nombre: string;
  categoria: string;
  imagen?: string;
  alergenos: string[];
  calorias: number;
  proteinas: number;
}

export interface CreateFoodUseCase {
  execute(dto: CreateFoodDto): Promise<Food>;
}
