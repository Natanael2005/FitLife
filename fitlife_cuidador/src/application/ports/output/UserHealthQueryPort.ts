import { Nivel } from '../../../domain/value-objects/health';

export type HealthContext = {
  imc: number;
  nivel: Nivel;
  allergies: Set<string>;   // slugs: 'gluten', 'lacteos', ...
  conditions: Set<string>;  // slugs: 'lesion_rodilla', ...
};

export interface UserHealthQueryPort {
  getHealthContext(userId: string): Promise<HealthContext>;
}
