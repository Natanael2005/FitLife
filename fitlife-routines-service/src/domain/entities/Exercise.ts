export interface ExerciseSnapshot {
  id: string;
  nombre: string;
  categoria: string;
  contraindicaciones: string[];
  impacto: 'BAJO' | 'MEDIO' | 'ALTO';
  nivel_minimo: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  series_recomendadas: number;
  repeticiones_recomendadas: number;
}
