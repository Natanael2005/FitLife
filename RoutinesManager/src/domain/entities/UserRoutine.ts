export class UserRoutine {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly routineId: string,
    public readonly assignedAt: Date,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}

  deactivate(): UserRoutine {
    return new UserRoutine(
      this.id,
      this.userId,
      this.routineId,
      this.assignedAt,
      false,
      this.createdAt
    );
  }

  activate(): UserRoutine {
    return new UserRoutine(
      this.id,
      this.userId,
      this.routineId,
      this.assignedAt,
      true,
      this.createdAt
    );
  }
}
