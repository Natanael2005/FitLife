export class UserRoutine {
  constructor(
    public readonly id: string,
    public readonly usuario_id: string,
    public readonly nombre: string,
    public readonly dias: string[],
    public readonly ejercicios: any[],
    public readonly alimentos: any[],
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  // Métodos helper si los necesitas
  isActiveOnDay(day: string): boolean {
    return this.dias.includes(day.toUpperCase());
  }

  getTotalExercises(): number {
    return this.ejercicios.length;
  }

  getTotalFoods(): number {
    return this.alimentos.length;
  }
}