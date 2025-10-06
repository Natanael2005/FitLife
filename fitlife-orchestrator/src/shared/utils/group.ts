// src/shared/utils/group.ts
import { Item } from '../../domain/entities/items.js';

export function groupItemsByCategory(ejercicios: Item[], alimentos: Item[]) {
  const result: Record<string, { ejercicios: Item[]; alimentos: Item[] }> = {};

  const group = (items: Item[], type: 'ejercicios' | 'alimentos') => {
    for (const item of items) {
      const category = item.categoria || 'Sin Categoría';
      if (!result[category]) {
        result[category] = { ejercicios: [], alimentos: [] };
      }
      result[category][type].push(item);
    }
  };

  group(ejercicios, 'ejercicios');
  group(alimentos, 'alimentos');

  return result;
}