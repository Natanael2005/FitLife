export interface DeleteRoutineUseCase {
  execute(payload: {
    routineId: string;
    userId: string;
  }): Promise<void>;
}
