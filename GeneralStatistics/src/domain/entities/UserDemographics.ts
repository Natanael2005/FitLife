export class UserDemographics {
  constructor(
    public readonly ageGroups: AgeGroupStats[],
    public readonly genderDistribution: GenderStats,
    public readonly locationStats: LocationStats[],
    public readonly fitnessLevels: FitnessLevelStats[]
  ) {}
}

interface AgeGroupStats {
  ageRange: string;
  count: number;
  percentage: number;
}

interface GenderStats {
  male: number;
  female: number;
  other: number;
}

interface LocationStats {
  country: string;
  userCount: number;
  percentage: number;
}

interface FitnessLevelStats {
  level: 'beginner' | 'intermediate' | 'advanced';
  count: number;
  percentage: number;
}
