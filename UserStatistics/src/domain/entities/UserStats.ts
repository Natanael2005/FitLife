export class UserStats {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly currentWeight: number,
    public readonly currentHeight: number,
    public readonly bmi: number,
    public readonly lastUpdated: Date,
    public readonly createdAt: Date
  ) {}

  calculateBMI(): number {
    return this.currentWeight / Math.pow(this.currentHeight / 100, 2);
  }

  getBMICategory(): string {
    if (this.bmi < 18.5) return 'Bajo peso';
    if (this.bmi < 25) return 'Peso normal';
    if (this.bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }
}
