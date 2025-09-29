export class UserStats {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly currentWeight: number,
    public readonly targetWeight: number,
    public readonly currentHeight: number,
    public readonly workoutStreak: number,
    public readonly totalWorkouts: number,
    public readonly totalCaloriesBurned: number,
    public readonly averageWorkoutDuration: number,
    public readonly bmi: number,
    public readonly lastUpdated: Date,
    public readonly weeklyGoalProgress: number,
    public readonly createdAt: Date
  ) {}

  calculateBMI(): number {
    return this.currentWeight / Math.pow(this.currentHeight / 100, 2);
  }

  isGoalAchieved(): boolean {
    return this.currentWeight <= this.targetWeight;
  }

  getProgressPercentage(): number {
    const startWeight = this.targetWeight + 10; 
    const progress = ((startWeight - this.currentWeight) / (startWeight - this.targetWeight)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
}