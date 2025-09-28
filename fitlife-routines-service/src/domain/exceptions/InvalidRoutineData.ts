export class InvalidRoutineData extends Error {
  constructor(message: string) {
    super(`Invalid routine data: ${message}`);
    this.name = 'InvalidRoutineData';
  }
}
