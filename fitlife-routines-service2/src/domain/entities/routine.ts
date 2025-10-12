// --- Snapshot de un Ítem (Ejercicio o Alimento) ---
// Esta es la estructura COMPLETA que guardaremos en la base de datos (JSONB)
// para que la rutina sea autocontenida.
export interface ItemSnapshot {
  id: string;
  nombre: string;
  categoria: string;
  // ...y todos los demás campos que definimos para ejercicios y alimentos.
  [key: string]: any; // Permite campos adicionales.
}

// --- Rutina Completa (La entidad principal) ---
// Así es como se ve una rutina una vez que está en nuestro sistema.
export interface Routine {
  id: string; // UUID
  usuario_id: string;
  nombre: string;
  dias: string[];
  ejercicios: ItemSnapshot[]; // Guardamos el snapshot completo
  alimentos: ItemSnapshot[];  // Guardamos el snapshot completo
  created_at: Date;
  updated_at: Date;
}

// --- Input para Crear una Rutina (¡NUEVO REQUISITO!) ---
// Esto es lo que el Orquestador enviará a nuestro servicio.
// Solo contiene los IDs, no los objetos completos.
export interface RoutineCreationInput {
  usuario_id: string;
  nombre: string;
  dias: string[];
  ejercicio_ids: string[]; // Solo IDs
  alimento_ids: string[];  // Solo IDs
}