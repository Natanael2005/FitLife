import { FoodRepository } from '../ports/output/FoodRepository';
import { Food } from '../../domain/entities/Food';
import { FoodFilters } from '../ports/input/GetFoodsUseCase';
import { CreateFoodDto } from '../ports/input/CreateFoodUseCase';
import { FoodNotFound, DuplicateEntry } from '../../domain/exceptions/CatalogExceptions';

export class FoodService {
  constructor(private readonly foodRepository: FoodRepository) {}

  async getFoods(filters?: FoodFilters): Promise<Food[]> {
    return await this.foodRepository.findAll(filters);
  }

  async createFood(dto: CreateFoodDto): Promise<Food> {
    const existing = await this.foodRepository.findByNombre(dto.nombre);
    if (existing) {
      throw new DuplicateEntry(`Food '${dto.nombre}' already exists`);
    }

    const id = `alim-${Date.now()}`;
    const food = new Food(
      id,
      dto.nombre,
      dto.categoria,
      dto.imagen || '',
      dto.alergenos,
      dto.calorias,
      dto.proteinas,
      true,
      new Date()
    );

    return await this.foodRepository.save(food);
  }

  async getFoodById(id: string): Promise<Food> {
    const food = await this.foodRepository.findById(id);
    if (!food) {
      throw new FoodNotFound(`Food ${id} not found`);
    }
    return food;
  }

  async updateFood(id: string, updates: Partial<Food>): Promise<Food> {
    const existing = await this.foodRepository.findById(id);
    if (!existing) {
      throw new FoodNotFound(`Food ${id} not found`);
    }

    return await this.foodRepository.update(id, updates);
  }

  async deleteFood(id: string): Promise<void> {
    const existing = await this.foodRepository.findById(id);
    if (!existing) {
      throw new FoodNotFound(`Food ${id} not found`);
    }

    await this.foodRepository.delete(id);
  }
}
