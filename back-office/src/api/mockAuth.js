// Faux backend d'authentification, uniquement pour le développement
// (VITE_USE_MOCK_AUTH=true). Il imite les réponses de la vraie API.
// Identifiants de démo (ceux de la maquette) : squad@orienta.cg / orienta2026
import { ApiError } from './http';
import { clearSession, readSession, saveSession } from './session';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password) {
  await delay();
  if (email === 'squad@orienta.cg' && password === 'orienta2026') {
    const user = {
      email: 'squad@orienta.cg',
      nom: 'Squad',
      role: 'superadmin',
      quand: new Date().toISOString(),
    };
    saveSession('jeton-de-demonstration', user);
    return { user };
  }
  throw new ApiError(401, 'Adresse e-mail ou mot de passe incorrect.', 'IDENTIFIANTS_INVALIDES');
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
