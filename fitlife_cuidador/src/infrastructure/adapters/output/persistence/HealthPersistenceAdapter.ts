import { DataSource } from "typeorm";
import { HealthPersistencePort } from "../../../../application/ports/output/HealthPersistencePort";
import { User } from "../../../../domain/entities/User";
import { UserHealthData, Nivel, CategoriaIMC } from "../../../../domain/entities/UserHealthData";
import { UserAllergy } from "../../../../domain/entities/UserAllergy";
import { UserMedicalCondition } from "../../../../domain/entities/UserMedicalCondition";
import { Allergy } from "../../../../domain/entities/Allergy";
import { MedicalCondition } from "../../../../domain/entities/MedicalCondition";
import { cleanTokens } from "../../../../shared/tokens";

export class HealthPersistenceAdapter implements HealthPersistencePort {
  constructor(private readonly ds: DataSource) {}

  async findUserById(userId: string) {
    const u = await this.ds.getRepository(User).findOne({ where: { id: userId } });
    if (!u) return null;
    return { id: u.id, firebaseUid: (u as any).firebaseUid ?? null };
  }

  async readHealth(userId: string) {
    const row = await this.ds.getRepository(UserHealthData).findOne({ where: { user_id: userId } as any });
    if (!row) return null;
    return {
      pesoKg: row.peso_kg != null ? Number(row.peso_kg) : null,
      estaturaCm: (row as any).estatura_cm ?? null,
      nivel: (row as any).nivel ?? null,
      imcStr: row.imc ?? null,
      categoria: (row as any).categoria_imc ?? null,
    };
  }

  async listAllergiesByUser(userId: string) {
    const rows = await this.ds.getRepository(Allergy)
      .createQueryBuilder("a")
      .innerJoin(UserAllergy, "ua", "ua.allergy_id = a.id AND ua.user_id = :id", { id: userId })
      .getMany();
    return rows.map(r => ({ slug: r.slug, nombre: (r as any).nombre ?? (r as any).name ?? r.slug }));
  }

  async listConditionsByUser(userId: string) {
    const rows = await this.ds.getRepository(MedicalCondition)
      .createQueryBuilder("m")
      .innerJoin(UserMedicalCondition, "um", "um.condition_id = m.id AND um.user_id = :id", { id: userId })
      .getMany();
    return rows.map(r => ({ slug: r.slug, nombre: (r as any).nombre ?? (r as any).name ?? r.slug }));
  }

  async upsertHealth(userId: string, patch: {
    pesoKg?: number | null; estaturaCm?: number | null; nivel?: Nivel | null; imc?: number | null; categoria_imc?: CategoriaIMC | null;
  }) {
    const repo = this.ds.getRepository(UserHealthData);
    const existing = await repo.findOne({ where: { user_id: userId } as any });

    const toPatch: any = {};
    if (patch.pesoKg !== undefined) toPatch.peso_kg = patch.pesoKg != null ? Number(patch.pesoKg).toFixed(2) : null;
    if (patch.estaturaCm !== undefined) toPatch.estatura_cm = patch.estaturaCm;
    if (patch.nivel !== undefined) toPatch.nivel = patch.nivel;
    if (patch.imc !== undefined) toPatch.imc = patch.imc != null ? patch.imc.toFixed(2) : null;
    if (patch.categoria_imc !== undefined) toPatch.categoria_imc = patch.categoria_imc;

    if (existing) {
      await repo.update({ user_id: userId } as any, toPatch);
    } else {
      await repo.insert({ user_id: userId, ...toPatch } as any);
    }
  }

  // [] => sin relaciones. Limpia sentinelas y reescribe puentes
  async replaceAllergiesBySlugs(userId: string, slugs: string[]): Promise<void> {
    const up = cleanTokens(slugs ?? []);
    const repoUA = this.ds.getRepository(UserAllergy);
    await repoUA.delete({ user_id: userId });
    if (up.length === 0) return;

    const alergias = await this.ds.getRepository(Allergy)
      .createQueryBuilder("a").where("a.slug IN (:...s)", { s: up }).getMany();

    if (alergias.length === 0) return;

    await repoUA.createQueryBuilder()
      .insert()
      .values(alergias.map(a => ({ user_id: userId, allergy_id: a.id }))) // ← a.id (no a.allergy_id)
      .execute();
  }

  async replaceConditionsBySlugs(userId: string, slugs: string[]): Promise<void> {
    const up = cleanTokens(slugs ?? []);
    const repoUMC = this.ds.getRepository(UserMedicalCondition);
    await repoUMC.delete({ user_id: userId });
    if (up.length === 0) return;

    const conds = await this.ds.getRepository(MedicalCondition)
      .createQueryBuilder("m").where("m.slug IN (:...s)", { s: up }).getMany();

    if (conds.length === 0) return;

    await repoUMC.createQueryBuilder()
      .insert()
      .values(conds.map(m => ({ user_id: userId, condition_id: m.id }))) // ← m.id (no m.condition_id)
      .execute();
  }
}
