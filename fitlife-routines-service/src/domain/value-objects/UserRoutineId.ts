import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class UserRoutineId {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!uuidValidate(value)) {
        throw new Error('Invalid user routine ID format');
      }
      this.value = value;
    } else {
      this.value = uuidv4();
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserRoutineId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}