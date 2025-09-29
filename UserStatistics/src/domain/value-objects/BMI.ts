export class BMI {
  constructor(private readonly value: number) {
    if (value < 10 || value > 50) {
      throw new Error('BMI value must be between 10 and 50');
    }
  }

  getValue(): number {
    return this.value;
  }

  getCategory(): string {
    if (this.value < 18.5) return 'Bajo peso';
    if (this.value < 25) return 'Peso normal';
    if (this.value < 30) return 'Sobrepeso';
    return 'Obesidad';
  }
}
