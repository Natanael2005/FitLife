export class InvalidRoutineData extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRoutineData';
  }
}
