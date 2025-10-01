export class WorkoutHistory {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly routineName: string,
    public readonly routineId: string,
    public readonly completedAt: Date,
    public readonly createdAt: Date
  ) {}
}
