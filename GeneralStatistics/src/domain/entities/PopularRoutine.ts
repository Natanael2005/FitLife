export class PopularRoutine {
  constructor(
    public readonly routineId: string,
    public readonly name: string,
    public readonly category: string,
    public readonly usageCount: number,
    public readonly averageRating: number,
    public readonly averageDuration: number,
    public readonly lastWeekGrowth: number
  ) {}

  isPopular(): boolean {
    return this.usageCount > 100 && this.averageRating > 4.0;
  }
}
