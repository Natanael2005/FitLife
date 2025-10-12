export interface ExerciseSnapshot {
  id: string;
  nombre: string;
  categoria: string;
  contraindicaciones: string[];
  // nivel: 'BAJO' | 'INTERMEDIO' | 'AVANZADO';
  nivel: string[]; // Temporalmente deshabilitado el enum para permitir niveles personalizados
  series_recomendadas: number;
  repeticiones_recomendadas: number;
  gif_url: string;
  musculo_principal: string;
  musculo_secundario: string;
  instrucciones?: string[];
  isActive?: boolean;
}
