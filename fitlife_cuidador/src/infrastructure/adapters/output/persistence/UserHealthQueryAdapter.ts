import { DataSource } from 'typeorm';
import { UserHealthQueryPort, HealthContext } from '../../../../application/ports/output/UserHealthQueryPort';
import { UserHealthData } from '../../../../domain/entities/UserHealthData';
import { UserAllergy } from '../../../../domain/entities/UserAllergy';
import { UserMedicalCondition } from '../../../../domain/entities/UserMedicalCondition';
import { Allergy } from '../../../../domain/entities/Allergy';
import { MedicalCondition } from '../../../../domain/entities/MedicalCondition';
import { cleanTokens } from '../../../../shared/tokens';

export class UserHealthQueryAdapter implements UserHealthQueryPort {
  constructor(private readonly ds: DataSource) {}

  async getHealthContext(userId: string): Promise<HealthContext> {
    const uhdRepo = this.ds.getRepository(UserHealthData);
    const health = await uhdRepo.findOne({ where: { user_id: userId } });

    if (!health) {
      const err: any = new Error('NOT_FOUND');
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

    // HealthContext.imc es number (no null) → usa 0 cuando falte
    const imc: HealthContext['imc'] = health.imc != null ? Number(health.imc) : 0;

    const allergies = new Set<string>(cleanTokens((rowsAllergies ?? []).map(r => String(r.slug))));
    const conditions = new Set<string>(cleanTokens((rowsConds ?? []).map(r => String(r.slug))));

    // HealthContext.nivel es el 'Nivel' del puerto (PRINCIPIANTE|INTERMEDIO|AVANZADO)
    const nivel: HealthContext['nivel'] = (() => {
      const raw = String((health as any).nivel ?? '').toUpperCase(); // BD: BAJO|INTERMEDIO|AVANZADO
      if (raw === 'BAJO') return 'PRINCIPIANTE' as HealthContext['nivel'];
      if (raw === 'INTERMEDIO') return 'INTERMEDIO' as HealthContext['nivel'];
      if (raw === 'AVANZADO') return 'AVANZADO' as HealthContext['nivel'];
      return 'PRINCIPIANTE' as HealthContext['nivel'];
    })();

    return { imc, nivel, allergies, conditions };
  }
}
