export interface RemoveRoutineUseCase {
  execute(userId: string, routineId: string): Promise<void>;
}
