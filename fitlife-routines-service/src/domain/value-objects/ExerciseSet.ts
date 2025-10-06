export class ExerciseSet {
  private readonly series: number;
  private readonly repetitions?: number;
  private readonly durationMinutes?: number;
  private readonly restSeconds?: number;

  constructor(params: {
    series: number;
    repetitions?: number;
    durationMinutes?: number;
    restSeconds?: number;
  }) {
    if (params.series < 1) {
      throw new Error('Series must be at least 1');
    }
    
    if (params.repetitions !== undefined && params.repetitions < 1) {
      throw new Error('Repetitions must be at least 1');
    }
    
    if (params.durationMinutes !== undefined && params.durationMinutes < 1) {
      throw new Error('Duration must be at least 1 minute');
    }

    this.series = params.series;
    this.repetitions = params.repetitions;
    this.durationMinutes = params.durationMinutes;
    this.restSeconds = params.restSeconds;
  }

  getSeries(): number {
    return this.series;
  }

  getRepetitions(): number | undefined {
    return this.repetitions;
  }

  getDurationMinutes(): number | undefined {
    return this.durationMinutes;
  }

  getRestSeconds(): number | undefined {
    return this.restSeconds;
  }

  toJSON() {
    return {
      series: this.series,
      repetitions: this.repetitions,
      durationMinutes: this.durationMinutes,
      restSeconds: this.restSeconds
    };
  }
}