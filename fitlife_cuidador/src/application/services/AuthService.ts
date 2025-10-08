import { AuthProviderPort, FirebaseAuthResponse } from "../ports/output/AuthProviderPort";
import { AppUser, Gender, UserRepositoryPort } from "../ports/output/UserRepositoryPort";

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: Gender;
  returnSecureToken?: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
  returnSecureToken?: boolean;
};

export type CombinedAuthResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;    // uid
  email: string;
  userId: string;     // uuid app
  profile_completed: boolean;
  firstName: string;
  lastName: string;
  gender: Gender;
};

const normGender = (g?: Gender) => (g === 'masculino' || g === 'femenino' || g === 'otro' ? g : null);

export class AuthService {
  constructor(
    private readonly authProvider: AuthProviderPort,
    private readonly users: UserRepositoryPort
  ) {}

  private combine(fb: FirebaseAuthResponse, u: AppUser): CombinedAuthResponse {
    return {
      idToken: fb.idToken,
      refreshToken: fb.refreshToken,
      expiresIn: fb.expiresIn,
      localId: fb.localId,
      email: fb.email,
      userId: u.id,
      profile_completed: u.profileCompleted,
      firstName: u.firstName,
      lastName: u.lastName,
      gender: u.gender,
    };
  }

  async register(input: RegisterInput): Promise<CombinedAuthResponse> {
    const gender = normGender(input.gender ?? null);
    const fb = await this.authProvider.signUp(input.email, input.password, input.returnSecureToken ?? true);

    const existing = await this.users.findByFirebaseUidOrEmail(fb.localId, fb.email);
    const user = await this.users.createOrUpdate({
      id: existing?.id,
      firebaseUid: fb.localId,
      email: fb.email,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: gender ?? null,
      profileCompleted: existing?.profileCompleted ?? false,
    });

    return this.combine(fb, user);
  }

  async login(input: LoginInput): Promise<CombinedAuthResponse> {
    const fb = await this.authProvider.signIn(input.email, input.password, input.returnSecureToken ?? true);
    const user = await this.users.ensureOnLogin(fb.localId, fb.email);
    return this.combine(fb, user);
  }

  /** ⬅️ NUEVO: Perfil público por UUID del usuario (sin Bearer). */
  async profileById(userId: string) {
    const user = await this.users.getById(userId);
    if (!user) throw new Error('NOT_FOUND');
    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      profile_completed: user.profileCompleted,
    };
  }
}
