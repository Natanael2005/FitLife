export class Exercise {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly categoria: string,
    public readonly contraindicaciones: string[],
    public readonly nivel: string[],
    public readonly series_recomendadas: number,
    public readonly repeticiones_recomendadas: number,
    public readonly gifUrl: string,
    public readonly musculo_principal: string,
    public readonly musculo_secundario: string,
    public readonly instrucciones: string[],
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}
}
