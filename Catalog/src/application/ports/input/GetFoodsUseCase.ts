import { Food } from '../../../domain/entities/Food';

export interface FoodFilters {
  categoria?: string;
  maxCalorias?: number;
  minProteinas?: number;
  alergenos?: string[];
  search?: string;
}

export interface GetFoodsUseCase {
  execute(filters?: FoodFilters): Promise<Food[]>;
}