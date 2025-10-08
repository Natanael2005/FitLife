import { DataSource } from "typeorm";
import { HealthPersistencePort } from "../../../../application/ports/output/HealthPersistencePort";
import { User } from "./../../../../domain/entities/User";
import { UserHealthData, Nivel, CategoriaIMC } from "./../../../../domain/entities/UserHealthData";
import { UserAllergy } from "./../../../../domain/entities/UserAllergy";
import { UserMedicalCondition } from "./../../../../domain/entities/UserMedicalCondition";
import { Allergy } from "./../../../../domain/entities/Allergy";
import { MedicalCondition } from "./../../../../domain/entities/MedicalCondition";

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
    return rows.map(r => ({ slug: r.slug, nombre: (r as any).name ?? (r as any).nombre ?? r.slug }));
  }

  async listConditionsByUser(userId: string) {
    const rows = await this.ds.getRepository(MedicalCondition)
      .createQueryBuilder("m")
      .innerJoin(UserMedicalCondition, "um", "um.condition_id = m.id AND um.user_id = :id", { id: userId })
      .getMany();
    return rows.map(r => ({ slug: r.slug, nombre: (r as any).name ?? (r as any).nombre ?? r.slug }));
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

  async replaceAllergiesBySlugs(userId: string, slugs: string[]) {
    const ids = await this.ds.getRepository(Allergy)
      .createQueryBuilder("a").where("a.slug IN (:...s)", { s: slugs }).getMany();
    const uaRepo = this.ds.getRepository(UserAllergy);
    await uaRepo.delete({ user_id: userId } as any);
    if (ids.length) await uaRepo.insert(ids.map(a => ({ user_id: userId, allergy_id: a.id } as any)));
  }

  async replaceConditionsBySlugs(userId: string, slugs: string[]) {
    const ids = await this.ds.getRepository(MedicalCondition)
      .createQueryBuilder("m").where("m.slug IN (:...s)", { s: slugs }).getMany();
    const umRepo = this.ds.getRepository(UserMedicalCondition);
    await umRepo.delete({ user_id: userId } as any);
    if (ids.length) await umRepo.insert(ids.map(m => ({ user_id: userId, condition_id: m.id } as any)));
  }
}
