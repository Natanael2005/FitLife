export interface FoodSnapshot {
  id: string;
  nombre: string;
  categoria: string;
  imagen?: string;
  alergenos: string[];
  calorias: number;
  proteinas: number;
  isActive?: boolean;
}
