// URL de l'API : VITE_API_URL (voir .env.example), sans barre finale.
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  // status : statut HTTP (0 = serveur injoignable) ; code : code machine du contrat.
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Appelle l'API et renvoie le JSON de la réponse.
 * Le site public n'a pas de compte : aucun jeton n'est envoyé.
 *
 *   request('/programs')                          -> GET
 *   request('/contact', { method: 'POST', body }) -> POST avec un corps JSON
 */
export async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message, data?.code);
  return data;
}
