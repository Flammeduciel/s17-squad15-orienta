// Faux backend d'authentification, uniquement pour le développement
// (VITE_USE_MOCK_AUTH=true). Il imite les réponses de la vraie API.
// Identifiants de démo (ceux de la maquette) : squad / orienta2026
import { ApiError } from './http';
import { clearSession, readSession, saveSession } from './session';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function login(identifiant, password) {
  await delay();
  if (identifiant === 'squad' && password === 'orienta2026') {
    const user = {
      login: 'squad',
      nom: 'Squad',
      role: 'superadmin',
      quand: new Date().toISOString(),
    };
    saveSession('jeton-de-demonstration', user);
    return { user };
  }
  throw new ApiError(401, 'Identifiant ou mot de passe incorrect.', 'IDENTIFIANTS_INVALIDES');
}

export async function logout() {
  await delay(150);
  clearSession();
}

export async function me() {
  await delay(150);
  const session = readSession();
  if (session) return { user: session.user };
  throw new ApiError(401, 'Non authentifié.');
}

export async function forgotPassword() {
  await delay();
  return null;
}

export async function resetPassword(token) {
  await delay();
  if (!token) throw new ApiError(400, 'Ce lien de réinitialisation est invalide ou a expiré.', 'LIEN_INVALIDE');
  return null;
}
