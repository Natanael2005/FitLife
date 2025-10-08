// src/domain/entities/routine.ts

import { Item } from './items.js';

// Días válidos para una rutina
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

// Snapshot de la rutina que envía el frontend para crear/actualizar
export interface RoutineSnapshot {
  usuario_id: string;
  nombre: string;
  dias: DiaSemana[];
  ejercicios: Item[];
  alimentos: Item[];
}

// La rutina completa, con su ID generado por el servicio de Rutinas
export interface Routine extends RoutineSnapshot {
  id: string; // UUID
  creada_en: string; // ISO Date
  actualizada_en: string; // ISO Date
}