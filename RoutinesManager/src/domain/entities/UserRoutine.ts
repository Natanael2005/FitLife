export class UserRoutine {
  constructor(
    public readonly id: number,
    public readonly usuario_id: string,
    public readonly rutina_id: string,
    public readonly assignedAt: Date,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}

  deactivate(): UserRoutine {
    return new UserRoutine(
      this.id,
      this.usuario_id,
      this.rutina_id,
      this.assignedAt,
      false,
      this.createdAt
    );
  }

  activate(): UserRoutine {
    return new UserRoutine(
      this.id,
      this.usuario_id,
      this.rutina_id,
      this.assignedAt,
      true,
      this.createdAt
    );
  }
}
