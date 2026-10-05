import { USE_MOCK_AUTH } from '../config';
import { request } from './http';
import * as mock from './mockAuth';

// Contrat attendu de l'API (BK2) : voir le README.
const real = {
  login: (login, password) => request('/auth/login', { method: 'POST', body: { login, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: { token, password } }),
};

const api = USE_MOCK_AUTH ? mock : real;

export const login = api.login;
export const logout = api.logout;
export const me = api.me;
export const forgotPassword = api.forgotPassword;
export const resetPassword = api.resetPassword;
