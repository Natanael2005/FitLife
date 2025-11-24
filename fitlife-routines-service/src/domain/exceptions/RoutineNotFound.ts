export class RoutineNotFound extends Error {
  constructor(message = 'Routine not found') {
    super(message);
    this.name = 'RoutineNotFound';
  }
}
