import { FoodPortion } from '../value-objects/FoodPortion.js';

export class Food {
  private foodId: string;
  private portion: FoodPortion;

  constructor(params: {
    foodId: string;
    portion: FoodPortion;
  }) {
    this.foodId = params.foodId;
    this.portion = params.portion;
  }

  getFoodId(): string {
    return this.foodId;
  }

  getPortion(): FoodPortion {
    return this.portion;
  }

  updatePortion(newPortion: FoodPortion): void {
    this.portion = newPortion;
  }

  toJSON() {
    return {
      foodId: this.foodId,
      ...this.portion.toJSON()
    };
  }
}