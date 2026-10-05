<<<<<<< HEAD
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? `La requête a échoué (${response.status}).`,
      data?.code,
    )
  }
  return data
=======
// URL de l'API : VITE_API_URL (voir .env.example), sans barre finale.
// Les chemins s'ajoutent à cette base : request('/programs') appelle {VITE_API_URL}/programs.
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

// Au-delà, l'appel est abandonné plutôt que de laisser la page en chargement.
const TIMEOUT_MS = 30000;

export class ApiError extends Error {
  // status : statut HTTP (0 = serveur injoignable) ; code : code machine du contrat (ex. FORMATION_INTROUVABLE).
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Message de repli quand l'API n'en fournit pas (réponse sans corps, erreur du serveur web).
function defaultMessage(status) {
  if (status === 400) return 'Les informations envoyées ne sont pas valides.';
  if (status === 404) return 'Cette ressource est introuvable.';
  if (status >= 500) return 'Le serveur a rencontré un problème. Réessayez dans un instant.';
  return 'Une erreur est survenue.';
}

// Message à montrer à l'utilisateur : celui de l'API, ou un message neutre pour toute autre erreur.
export function errorMessage(error) {
  return error instanceof ApiError && error.message ? error.message : 'Une erreur est survenue. Réessayez.';
}

// Les paramètres vides (undefined, null, '') sont ignorés : on peut passer les filtres tels quels.
function buildUrl(path, params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') query.append(key, value);
  }
  const search = query.toString();
  return API_URL + path + (search ? `?${search}` : '');
}

/**
 * Client HTTP de l'application (le contrat est docs/openapi.yaml).
 * - params : paramètres de requête, ajoutés à l'adresse ;
 * - body : objet envoyé en JSON, ou FormData pour un dépôt de fichier ;
 * - lève une ApiError avec le statut et le code d'erreur renvoyés par l'API ;
 * - une réponse sans corps (202, 204) renvoie null.
 */
export async function request(path, { method = 'GET', params, body } = {}) {
  const headers = {};
  let payload;
  if (body instanceof FormData) {
    // Pas de Content-Type : le navigateur le fixe lui-même, avec la limite du multipart.
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: payload,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message ?? defaultMessage(res.status), data?.code);
  return data;
}

// Les images déposées sont servies par l'API : l'adresse reçue est relative (« /uploads/… »).
export function imageUrl(path) {
  if (!path) return null;
  return /^https?:\/\//.test(path) ? path : API_URL + path;
>>>>>>> develop
}
