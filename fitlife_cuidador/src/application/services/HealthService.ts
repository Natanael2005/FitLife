import { HealthPersistencePort, HealthSnapshot } from "../ports/output/HealthPersistencePort";
import { CategoriaIMC, Nivel } from "../../domain/entities/UserHealthData";

export type PublicPutDto = {
  pesoKg?: number;
  estaturaCm?: number;
  nivel?: Nivel;
  alergias?: string[];     // slugs
  condiciones?: string[];  // slugs
};

export type PrivatePutDto = {
  pesoKg: number;
  estaturaCm: number;
  nivel: Nivel;
  alergias: string[];
  condiciones: string[];
};

export class HealthService {
  constructor(private readonly port: HealthPersistencePort) {}

  // ---- helpers ----
  private computeIMCNullable(pesoKg?: number | null, estaturaCm?: number | null):
    { imc: number | null; categoria_imc: CategoriaIMC | null } {
    if (!pesoKg || !estaturaCm || pesoKg <= 0 || estaturaCm <= 0) {
      return { imc: null, categoria_imc: null };
    }
    const m = estaturaCm / 100;
    const imc = +(pesoKg / (m * m)).toFixed(2);
    let categoria: CategoriaIMC;
    if (imc < 18.5) categoria = 'BAJO_PESO';
    else if (imc < 25) categoria = 'NORMAL';
    else if (imc < 30) categoria = 'SOBREPESO';
    else if (imc < 35) categoria = 'OBESIDAD_I';
    else if (imc < 40) categoria = 'OBESIDAD_II';
    else categoria = 'OBESIDAD_III';
    return { imc, categoria_imc: categoria };
  }

  private async snapshot(userId: string): Promise<HealthSnapshot> {
    const h = await this.port.readHealth(userId);
    const alergias = await this.port.listAllergiesByUser(userId);
    const condiciones = await this.port.listConditionsByUser(userId);

    const imc =
      h?.imcStr != null && !Number.isNaN(Number(h.imcStr))
        ? Number(h.imcStr)
        : this.computeIMCNullable(h?.pesoKg ?? null, h?.estaturaCm ?? null).imc;

    const categoria_imc =
      h?.categoria ?? this.computeIMCNullable(h?.pesoKg ?? null, h?.estaturaCm ?? null).categoria_imc;

    return {
      userId,
      pesoKg: h?.pesoKg ?? null,
      estaturaCm: h?.estaturaCm ?? null,
      nivel: h?.nivel ?? null,
      imc: imc ?? null,
      categoria_imc: categoria_imc ?? null,
      alergias,
      condiciones,
    };
  }

  // =======================
  // PÚBLICOS (solo UUID)
  // =======================
  async getPublicById(userId: string): Promise<HealthSnapshot> {
    const u = await this.port.findUserById(userId);
    if (!u) throw new Error("USER_NOT_FOUND");
    return this.snapshot(userId);
  }

  async putPublicById(userId: string, dto: PublicPutDto): Promise<HealthSnapshot> {
    const u = await this.port.findUserById(userId);
    if (!u) throw new Error("USER_NOT_FOUND");

    // Si no existe ficha, exigir peso + estatura cuando se quiera crear
    const current = await this.port.readHealth(userId);
    const creating = !current;
    if (creating && (dto.pesoKg == null || dto.estaturaCm == null)) {
      throw new Error("MISSING_FIELDS");
    }
    // Si envían peso, exigir estatura para recalcular IMC
    if (dto.pesoKg != null && dto.estaturaCm == null) {
      throw new Error("NEED_HEIGHT");
    }

    const nextPeso = dto.pesoKg ?? current?.pesoKg ?? null;
    const nextEst  = dto.estaturaCm ?? current?.estaturaCm ?? null;
    const nextNivel: Nivel | null = dto.nivel ?? current?.nivel ?? 'BAJO';

    const { imc, categoria_imc } = this.computeIMCNullable(nextPeso, nextEst);

    await this.port.upsertHealth(userId, {
      pesoKg: nextPeso,
      estaturaCm: nextEst,
      nivel: nextNivel,
      imc,
      categoria_imc
    });

    if (dto.alergias) await this.port.replaceAllergiesBySlugs(userId, dto.alergias);
    if (dto.condiciones) await this.port.replaceConditionsBySlugs(userId, dto.condiciones);

    return this.snapshot(userId);
  }

  // =======================
  // PRIVADO (Bearer)
  // =======================
  async putPrivate(userId: string, firebaseUid: string, dto: PrivatePutDto): Promise<HealthSnapshot> {
    const u = await this.port.findUserById(userId);
    if (!u) throw new Error("USER_NOT_FOUND");
    if (u.firebaseUid !== firebaseUid) throw new Error("FORBIDDEN");

    const { imc, categoria_imc } = this.computeIMCNullable(dto.pesoKg, dto.estaturaCm);

    await this.port.upsertHealth(userId, {
      pesoKg: dto.pesoKg,
      estaturaCm: dto.estaturaCm,
      nivel: dto.nivel,
      imc,
      categoria_imc
    });

    if (dto.alergias) await this.port.replaceAllergiesBySlugs(userId, dto.alergias);
    if (dto.condiciones) await this.port.replaceConditionsBySlugs(userId, dto.condiciones);

    return this.snapshot(userId);
  }

  // ====== (Compat) Métodos antiguos con uid: redirigen a los nuevos ======
  async getPublic(userId: string, _uid?: string): Promise<HealthSnapshot> {
    return this.getPublicById(userId);
  }
  async putPublic(userId: string, _uid: string, dto: PublicPutDto): Promise<HealthSnapshot> {
    return this.putPublicById(userId, dto);
  }
}
