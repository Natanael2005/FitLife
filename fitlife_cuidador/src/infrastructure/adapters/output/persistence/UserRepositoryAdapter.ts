import { DataSource, DeepPartial } from "typeorm";
import { User } from "./../../../../domain/entities/User";
import {
  AppUser,
  Gender,
  UserRepositoryPort,
} from "../../../../application/ports/output/UserRepositoryPort";

const toAppUser = (u: User): AppUser => ({
  id: u.id,
  firebaseUid: (u as any).firebaseUid,
  email: u.email,
  firstName: (u as any).firstName ?? "",
  lastName: (u as any).lastName ?? "",
  gender: ((u as any).gender ?? null) as Gender,
  profileCompleted: (u as any).profileCompleted === true,
});

export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(private readonly ds: DataSource) {}

  private repo() {
    return this.ds.getRepository(User);
  }

  async findByFirebaseUidOrEmail(uid: string, email: string): Promise<AppUser | null> {
    const u = await this.repo().findOne({ where: [{ firebaseUid: uid }, { email }] });
    return u ? toAppUser(u) : null;
  }

  async createOrUpdate(user: Partial<AppUser> & { firebaseUid: string; email: string }): Promise<AppUser> {
    const repo = this.repo();

    const byId = user.id ? await repo.findOne({ where: { id: user.id as string } }) : null;
    const existing =
      byId ?? (await repo.findOne({ where: [{ firebaseUid: user.firebaseUid }, { email: user.email }] }));

    let entity: User;
    if (existing) {
      entity = existing;
      (entity as any).firebaseUid = user.firebaseUid;
      entity.email = user.email;
      if (user.firstName !== undefined) (entity as any).firstName = user.firstName ?? "";
      if (user.lastName  !== undefined) (entity as any).lastName  = user.lastName ?? "";
      if (user.gender    !== undefined) (entity as any).gender    = (user.gender ?? null) as any;
      if (user.profileCompleted !== undefined) (entity as any).profileCompleted = !!user.profileCompleted;
    } else {
      const partial: DeepPartial<User> = {
        firebaseUid: user.firebaseUid,
        email: user.email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        gender: (user.gender ?? null) as any,
        profileCompleted: user.profileCompleted ?? false,
      };
      entity = repo.create(partial); // ← retorna User (no array)
    }

    const saved = await repo.save(entity);
    return toAppUser(saved);
  }

  async ensureOnLogin(uid: string, email: string): Promise<AppUser> {
    const repo = this.repo();
    let entity = await repo.findOne({ where: [{ firebaseUid: uid }, { email }] });
    if (!entity) {
      const partial: DeepPartial<User> = {
        firebaseUid: uid,
        email,
        firstName: "",
        lastName: "",
        gender: null as any,
        profileCompleted: false,
      };
      entity = repo.create(partial);
      entity = await repo.save(entity);
    }
    return toAppUser(entity);
  }

  async getById(id: string): Promise<AppUser | null> {        // ⬅️ NUEVO
    const u = await this.repo().findOne({ where: { id } });
    return u ? toAppUser(u) : null;
  }
}
