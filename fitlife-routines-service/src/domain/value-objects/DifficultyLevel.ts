export enum DifficultyLevelType {
  BAJO = 'BAJO',
  INTERMEDIO = 'INTERMEDIO',
  AVANZADO = 'AVANZADO'
}

export class DifficultyLevel {
  private readonly value: DifficultyLevelType;

  constructor(value: DifficultyLevelType) {
    if (!Object.values(DifficultyLevelType).includes(value)) {
      throw new Error(`Invalid difficulty level: ${value}`);
    }
    this.value = value;
  }

  getValue(): DifficultyLevelType {
    return this.value;
  }

  getNumericLevel(): number {
    const levels: Record<DifficultyLevelType, number> = {
      [DifficultyLevelType.BAJO]: 1,
      [DifficultyLevelType.INTERMEDIO]: 2,
      [DifficultyLevelType.AVANZADO]: 3
    };
    return levels[this.value];
  }

  isHigherThan(other: DifficultyLevel): boolean {
    return this.getNumericLevel() > other.getNumericLevel();
  }

  toString(): string {
    return this.value;
  }
}