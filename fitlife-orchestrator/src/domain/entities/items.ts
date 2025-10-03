// src/domain/entities/items.ts

export interface Item {
  id: string;
  nombre: string;
  categoria?: string;
  // ... aquí irían otros metadatos del catálogo
}