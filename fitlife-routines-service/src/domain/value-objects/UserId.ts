import { validate as uuidValidate } from 'uuid';

export class UserId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || !uuidValidate(value)) {
      throw new Error('Invalid user ID format');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}