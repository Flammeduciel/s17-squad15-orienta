// Faux backend d'authentification, uniquement pour le développement.
// Identifiants de démo (ceux de la maquette) : squad / orienta2026
import { ApiError } from './http';

// Même clé que la maquette HTML : une session ouverte dans l'une est reconnue dans l'autre.
const KEY = 'orienta-bo-session';
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export async function login(identifiant, password) {
  await delay();
  if (identifiant === 'squad' && password === 'orienta2026') {
    const user = {
      login: 'squad',
      nom: 'Squad',
      role: 'SuperAdmin',
      quand: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(user));
    return { user };
  }
  throw new ApiError(401, 'Identifiants incorrects.');
}

export async function logout() {
  await delay(150);
  localStorage.removeItem(KEY);
  return { ok: true };
}

export async function me() {
  await delay(150);
  const user = readSession();
  if (user?.login) return { user };
  throw new ApiError(401, 'Non authentifié.');
}

export async function forgotPassword() {
  await delay();
  return { ok: true };
}

export async function resetPassword(token) {
  await delay();
  if (!token) throw new ApiError(400, 'Lien invalide ou expiré.');
  return { ok: true };
}
