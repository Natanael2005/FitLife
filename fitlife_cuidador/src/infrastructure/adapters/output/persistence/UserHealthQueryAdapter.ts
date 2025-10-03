import { DataSource } from 'typeorm';
import { UserHealthQueryPort, HealthContext } from '../../../../application/ports/output/UserHealthQueryPort';
import { UserHealthData } from '../../../../domain/entities/UserHealthData';
import { UserAllergy } from '../../../../domain/entities/UserAllergy';
import { UserMedicalCondition } from '../../../../domain/entities/UserMedicalCondition';
import { Allergy } from '../../../../domain/entities/Allergy';
import { MedicalCondition } from '../../../../domain/entities/MedicalCondition';

export class UserHealthQueryAdapter implements UserHealthQueryPort {
  constructor(private readonly ds: DataSource) {}

  async getHealthContext(userId: string): Promise<HealthContext> {
    const uhdRepo = this.ds.getRepository(UserHealthData);
    const health = await uhdRepo.findOne({ where: { user_id: userId } });
    if (!health) {
      const err: any = new Error('Health data not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const uaRepo = this.ds.getRepository(UserAllergy);
    const umcRepo = this.ds.getRepository(UserMedicalCondition);

    const rowsAllergies = await uaRepo.createQueryBuilder('ua')
      .innerJoin(Allergy, 'a', 'a.id = ua.allergy_id')
      .select(['a.slug AS slug'])
      .where('ua.user_id = :uid', { uid: userId })
      .getRawMany();

    const rowsConds = await umcRepo.createQueryBuilder('umc')
      .innerJoin(MedicalCondition, 'm', 'm.id = umc.condition_id')
      .select(['m.slug AS slug'])
      .where('umc.user_id = :uid', { uid: userId })
      .getRawMany();

    const imc = Number(health.imc);
    const allergies = new Set<string>((rowsAllergies ?? []).map(r => String(r.slug).toUpperCase()));
    const conditions = new Set<string>((rowsConds ?? []).map(r => String(r.slug).toUpperCase()));

    return {
      imc,
      nivel: health.nivel as any, // 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO'
      allergies,
      conditions,
    };
  }
}
