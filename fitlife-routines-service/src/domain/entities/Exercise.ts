import { ExerciseSet } from '../value-objects/ExerciseSet.js';

export class Exercise {
  private exerciseId: string;
  private order: number;
  private sets: ExerciseSet;

  constructor(params: {
    exerciseId: string;
    order: number;
    sets: ExerciseSet;
  }) {
    this.exerciseId = params.exerciseId;
    this.order = params.order;
    this.sets = params.sets;
  }

  getExerciseId(): string {
    return this.exerciseId;
  }

  getOrder(): number {
    return this.order;
  }

  getSets(): ExerciseSet {
    return this.sets;
  }

  updateOrder(newOrder: number): void {
    if (newOrder < 1) {
      throw new Error('Order must be at least 1');
    }
    this.order = newOrder;
  }

  updateSets(newSets: ExerciseSet): void {
    this.sets = newSets;
  }

  toJSON() {
    return {
      exerciseId: this.exerciseId,
      order: this.order,
      ...this.sets.toJSON()
    };
  }
}