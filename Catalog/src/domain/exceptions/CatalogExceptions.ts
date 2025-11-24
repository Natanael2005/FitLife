export class ExerciseNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExerciseNotFound';
  }
}

export class FoodNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FoodNotFound';
  }
}

export class DuplicateEntry extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateEntry';
  }
}
