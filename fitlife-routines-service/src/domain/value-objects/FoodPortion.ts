export type UnitType = 'gramos' | 'ml' | 'unidad' | 'taza' | 'cucharada';

export class FoodPortion {
  private readonly quantity: number;
  private readonly unit: UnitType;
  private readonly mealTime: string;
  private readonly schedule?: string;

  constructor(params: {
    quantity: number;
    unit: UnitType;
    mealTime: string;
    schedule?: string;
  }) {
    if (params.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!params.mealTime) {
      throw new Error('Meal time is required');
    }

    this.quantity = params.quantity;
    this.unit = params.unit;
    this.mealTime = params.mealTime;
    this.schedule = params.schedule;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getUnit(): UnitType {
    return this.unit;
  }

  getMealTime(): string {
    return this.mealTime;
  }

  getSchedule(): string | undefined {
    return this.schedule;
  }

  toJSON() {
    return {
      quantity: this.quantity,
      unit: this.unit,
      mealTime: this.mealTime,
      schedule: this.schedule
    };
  }
}