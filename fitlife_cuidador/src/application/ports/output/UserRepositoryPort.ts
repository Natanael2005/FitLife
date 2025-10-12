export type Gender = 'masculino' | 'femenino' | 'otro' | null;

export type AppUser = {
  id: string;               // uuid app
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  profileCompleted: boolean;
};

export interface UserRepositoryPort {
  findByFirebaseUidOrEmail(uid: string, email: string): Promise<AppUser | null>;
  createOrUpdate(user: Partial<AppUser> & { firebaseUid: string; email: string }): Promise<AppUser>;
  ensureOnLogin(uid: string, email: string): Promise<AppUser>; // crea mínimo si no existe
  getById(id: string): Promise<AppUser | null>;                // ⬅️ NUEVO
}
