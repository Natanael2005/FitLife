export interface ExerciseSnapshot {
  id: string;
  nombre: string;
  categoria: string;
  contraindicaciones: string[];
  nivel: 'BAJO' | 'INTERMEDIO' | 'AVANZADO';
  series_recomendadas: number;
  repeticiones_recomendadas: number;
  gifUrl: string;
  musculo_principal: string;
  musculo_secundario: string;
  instrucciones?: string[];
}
