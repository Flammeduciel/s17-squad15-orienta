import { USE_MOCK_AUTH } from '../config';
import { ApiError, request } from './http';
import * as mock from './mockAuth';
import { clearSession, readSession, saveSession } from './session';

// Appels à l'API d'authentification (bloc BK2). Le contrat est docs/openapi.yaml :
//   POST /auth/login                    { username, password } -> { token, name, role }
//   POST /auth/logout                   (jeton requis)          -> 204
//   POST /auth/password-reset           { email }               -> 202
//   POST /auth/password-reset/confirm   { token, password }     -> 204
const real = {
  async login(username, password) {
    const data = await request('/auth/login', { method: 'POST', body: { username, password } });
    const user = { login: username, nom: data.name, role: data.role, quand: new Date().toISOString() };
    saveSession(data.token, user);
    return { user };
  },

  // La session est fermée dans le navigateur même si l'appel échoue.
  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearSession();
    }
  },

  // L'API n'a pas de route « qui suis-je » : le compte connecté est celui gardé à la connexion.
  // Si son jeton a expiré, le premier appel à l'API le signalera (voir http.js).
  async me() {
    const session = readSession();
    if (!session) throw new ApiError(401, 'Non authentifié.');
    return { user: session.user };
  },

  forgotPassword: (email) => request('/auth/password-reset', { method: 'POST', body: { email } }),

  resetPassword: (token, password) =>
    request('/auth/password-reset/confirm', { method: 'POST', body: { token, password } }),
};

const api = USE_MOCK_AUTH ? mock : real;

export const login = api.login;
export const logout = api.logout;
export const me = api.me;
export const forgotPassword = api.forgotPassword;
export const resetPassword = api.resetPassword;
