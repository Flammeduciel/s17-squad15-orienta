const httpError = require('../utils/httpError');
const users = require('../models/users');
const auth = require('../services/auth');

/**
 * `POST /auth/login` — ouvre une session Squad (EX-16).
 *
 * Le message d'échec est le même que l'adresse e-mail soit inconnue ou le
 * mot de passe faux : il ne révèle pas quels comptes existent.
 *
 * @param {import('express').Request} req `req.valid.body` : `{ email, password }`.
 * @param {import('express').Response} res 200 `{ token, name, role }`.
 * @returns {Promise<void>}
 */
async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await users.findByEmail(email);
  const ok = await auth.checkPassword(password, user ? user.password_hash : null);
  if (!ok) {
    throw httpError(401, 'IDENTIFIANTS_INVALIDES', 'Adresse e-mail ou mot de passe incorrect.');
  }
  res.json({ token: auth.signSession(user), name: user.name, role: user.role });
}

/**
 * `POST /auth/logout` — ferme la session.
 *
 * Le jeton n'est pas enregistré côté serveur : c'est le back-office qui
 * l'oublie. La route confirme seulement que la session était valide. Un jeton
 * copié ailleurs reste utilisable jusqu'à son expiration (`JWT_EXPIRES_IN`).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res 204.
 */
function logout(req, res) {
  res.status(204).end();
}

module.exports = { login, logout };
