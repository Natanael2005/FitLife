import { AuthProviderPort, FirebaseAuthResponse } from "../../../../application/ports/output/AuthProviderPort";

const API_KEY = process.env.FIREBASE_WEB_API_KEY || '';

function fbUrl(path: string) {
  if (!API_KEY) throw new Error('MISSING_API_KEY');
  return `https://identitytoolkit.googleapis.com/v1/${path}?key=${API_KEY}`;
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await resp.json();
  if (!resp.ok) {
    const msg = (json?.error?.message as string) || 'AUTH_ERROR';
    const err = new Error(msg);
    (err as any).status = mapFirebaseErrorToStatus(msg);
    throw err;
  }
  return json as T;
}

function mapFirebaseErrorToStatus(msg: string): number {
  if (msg.includes('EMAIL_EXISTS')) return 409;
  if (msg.includes('INVALID_PASSWORD')) return 401;
  if (msg.includes('EMAIL_NOT_FOUND')) return 404;
  if (msg.includes('USER_DISABLED')) return 403;
  return 400;
}

export class FirebaseAuthProviderAdapter implements AuthProviderPort {
  async signUp(email: string, password: string, returnSecureToken = true): Promise<FirebaseAuthResponse> {
    return postJSON(fbUrl('accounts:signUp'), { email, password, returnSecureToken });
  }
  async signIn(email: string, password: string, returnSecureToken = true): Promise<FirebaseAuthResponse> {
    return postJSON(fbUrl('accounts:signInWithPassword'), { email, password, returnSecureToken });
  }
}
