import { Food } from '../../../domain/entities/Food';
import { FoodFilters } from '../../ports/input/GetFoodsUseCase';

export interface FoodRepository {
  findAll(filters?: FoodFilters): Promise<Food[]>;
  findById(id: string): Promise<Food | null>;
  findByNombre(nombre: string): Promise<Food | null>;
  save(food: Omit<Food, 'isActive' | 'createdAt'>): Promise<Food>;
  update(id: string, food: Partial<Food>): Promise<Food>;
  delete(id: string): Promise<void>;
}
