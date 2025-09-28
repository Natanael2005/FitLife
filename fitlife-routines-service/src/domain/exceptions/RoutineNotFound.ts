export class RoutineNotFound extends Error {
  constructor(routineId: string) {
    super(`Routine with id ${routineId} not found`);
    this.name = 'RoutineNotFound';
  }
}