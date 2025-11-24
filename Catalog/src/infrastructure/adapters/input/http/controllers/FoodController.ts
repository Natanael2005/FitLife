import { Request, Response } from 'express';
import { FoodService } from '../../../../../application/services/FoodService';

export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  async getFoods(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        categoria: req.query.categoria as string,
        maxCalorias: req.query.maxCalorias ? parseInt(req.query.maxCalorias as string) : undefined,
        minProteinas: req.query.minProteinas ? parseInt(req.query.minProteinas as string) : undefined,
        alergenos: req.query.alergenos ? (req.query.alergenos as string).split(',') : undefined,
        search: req.query.search as string
      };

      const foods = await this.foodService.getFoods(filters);
      res.json(foods);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFoodById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const food = await this.foodService.getFoodById(id);
      res.json(food);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createFood(req: Request, res: Response): Promise<void> {
    try {
      const food = await this.foodService.createFood(req.body);
      res.status(201).json(food);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateFood(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const food = await this.foodService.updateFood(id, req.body);
      res.json(food);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteFood(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.foodService.deleteFood(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
