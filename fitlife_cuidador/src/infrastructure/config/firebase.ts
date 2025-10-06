import admin from 'firebase-admin';

let inited = false;

export function initFirebaseAdmin() {
  if (inited) return;
  // Con GOOGLE_APPLICATION_CREDENTIALS en .env, esto basta
  admin.initializeApp();
  inited = true;
}

export function getFirebaseAdmin() {
  if (!inited) initFirebaseAdmin();
  return admin;
}
