// DeleteRoutineUseCase.ts
export interface DeleteRoutineUseCase {
  execute(id: string, usuarioId: string): Promise<void>;
}
