import { ActivityType } from "../value-objects/ActivityType";

export class Activity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly type: ActivityType,
    public readonly name: string,
    public readonly duration: number,
    public readonly caloriesBurned: number,
    public readonly date: Date,
    public readonly metadata: Record<string, any> = {},
    public readonly createdAt: Date
  ) {}

  isWorkout(): boolean {
    return this.type === ActivityType.WORKOUT;
  }

  isNutrition(): boolean {
    return this.type === ActivityType.NUTRITION;
  }
}
