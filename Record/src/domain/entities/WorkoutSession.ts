export class WorkoutSession {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly routineId: string,
    public readonly exercises: Exercise[],
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly totalCaloriesBurned: number,
    public readonly completed: boolean,
    public readonly createdAt: Date
  ) {}

  getDuration(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  getCompletionRate(): number {
    const completedExercises = this.exercises.filter(e => e.completed).length;
    return (completedExercises / this.exercises.length) * 100;
  }
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed: boolean;
}
