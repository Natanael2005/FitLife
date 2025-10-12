export type FirebaseAuthResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string; // uid
  email: string;
  registered?: boolean;
};

export interface AuthProviderPort {
  signUp(email: string, password: string, returnSecureToken?: boolean): Promise<FirebaseAuthResponse>;
  signIn(email: string, password: string, returnSecureToken?: boolean): Promise<FirebaseAuthResponse>;
}
