export class Food {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly categoria: string,
    public readonly imagen: string,
    public readonly alergenos: string[],
    public readonly calorias: number,
    public readonly proteinas: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}
}
