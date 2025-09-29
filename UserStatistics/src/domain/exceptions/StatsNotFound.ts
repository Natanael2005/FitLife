export class StatsNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StatsNotFound';
  }
}
