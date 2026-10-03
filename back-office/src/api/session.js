// Session du back-office, gardée dans le navigateur.
// L'API renvoie un jeton à la connexion (voir docs/openapi.yaml) : on le conserve
// ici avec le compte connecté, et http.js le renvoie à chaque appel.
const KEY = 'orienta-bo-session';

// Lit la session : { token, user } ou null.
export function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(KEY));
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
