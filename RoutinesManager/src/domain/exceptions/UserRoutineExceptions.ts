export class UserRoutineNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserRoutineNotFound';
  }
}

export class UserRoutineAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserRoutineAlreadyExists';
  }
}
