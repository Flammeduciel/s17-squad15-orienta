// URL de l'API : VITE_API_URL (voir .env.example), sans barre finale.
// Les chemins ci-dessous s'ajoutent à cette base : request('/auth/login') appelle {VITE_API_URL}/auth/login.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Client HTTP minimal (à remplacer par celui de S5 quand Arsène l'aura poussé).
 * - credentials: 'include' pour envoyer le cookie de session HttpOnly
 * - lève une ApiError avec le status (0 = serveur injoignable)
 */
export async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message);
  return data;
}
