import { clearSession, readSession } from './session';

// URL de l'API : VITE_API_URL (voir .env.example), sans barre finale.
// Les chemins ci-dessous s'ajoutent à cette base : request('/auth/login') appelle {VITE_API_URL}/auth/login.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

// Événement émis quand l'API refuse le jeton (expiré, compte supprimé) :
// AuthContext l'écoute pour ramener l'utilisateur à la page de connexion.
export const SESSION_EXPIRED = 'orienta:session-expiree';

export class ApiError extends Error {
  // status : statut HTTP (0 = serveur injoignable) ; code : code machine du contrat (ex. LIEN_INVALIDE).
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Client HTTP minimal (à remplacer par celui de S5 quand Arsène l'aura poussé).
 * - envoie le jeton de session dans l'en-tête Authorization, comme le demande le contrat ;
 * - lève une ApiError avec le statut et le code d'erreur renvoyés par l'API ;
 * - une réponse sans corps (202, 204) renvoie null.
 */
export async function request(path, { method = 'GET', body } = {}) {
  const session = readSession();
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (session) headers.Authorization = `Bearer ${session.token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Jeton refusé alors qu'on en envoyait un : la session n'est plus valable.
    if (res.status === 401 && session) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    }
    throw new ApiError(res.status, data?.message, data?.code);
  }
  return data;
}
