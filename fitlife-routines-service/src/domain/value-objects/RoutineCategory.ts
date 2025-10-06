export enum RoutineCategoryType {
  PERDIDA_PESO = 'PERDIDA_PESO',
  GANANCIA_MUSCULAR = 'GANANCIA_MUSCULAR',
  RESISTENCIA = 'RESISTENCIA',
  FLEXIBILIDAD = 'FLEXIBILIDAD',
  FUERZA = 'FUERZA',
  REHABILITACION = 'REHABILITACION',
  GENERAL = 'GENERAL'
}

export class RoutineCategory {
  private readonly value: RoutineCategoryType;

  constructor(value: RoutineCategoryType) {
    if (!Object.values(RoutineCategoryType).includes(value)) {
      throw new Error(`Invalid routine category: ${value}`);
    }
    this.value = value;
  }

  getValue(): RoutineCategoryType {
    return this.value;
  }

  getDisplayName(): string {
    const names: Record<RoutineCategoryType, string> = {
      [RoutineCategoryType.PERDIDA_PESO]: 'Pérdida de Peso',
      [RoutineCategoryType.GANANCIA_MUSCULAR]: 'Ganancia Muscular',
      [RoutineCategoryType.RESISTENCIA]: 'Resistencia',
      [RoutineCategoryType.FLEXIBILIDAD]: 'Flexibilidad',
      [RoutineCategoryType.FUERZA]: 'Fuerza',
      [RoutineCategoryType.REHABILITACION]: 'Rehabilitación',
      [RoutineCategoryType.GENERAL]: 'General'
    };
    return names[this.value];
  }

  toString(): string {
    return this.value;
  }
}