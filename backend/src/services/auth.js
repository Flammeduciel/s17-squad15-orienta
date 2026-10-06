/**
 * Mots de passe et jetons de la Squad.
 *
 * Le **jeton de session**, signé avec `JWT_SECRET`, est renvoyé à la connexion
 * puis envoyé dans l'en-tête `Authorization: Bearer <jeton>`.
 *
 * @module services/auth
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const BCRYPT_ROUNDS = 10;

/**
 * Hash comparé quand l'adresse e-mail n'existe pas : la réponse prend alors
 * le même temps qu'avec un mauvais mot de passe, et ne trahit pas quels comptes
 * existent.
 */
const DUMMY_HASH = bcrypt.hashSync('compte-inexistant', BCRYPT_ROUNDS);

/**
 * @param {string} password Mot de passe en clair.
 * @returns {Promise<string>} Hash bcrypt à enregistrer dans `users.password_hash`.
 */
function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * @param {string} password Mot de passe saisi.
 * @param {string|null} passwordHash Hash enregistré, ou `null` si le compte n'existe pas.
 * @returns {Promise<boolean>}
 */
async function checkPassword(password, passwordHash) {
  const match = await bcrypt.compare(password, passwordHash || DUMMY_HASH);
  return Boolean(passwordHash) && match;
}

/**
 * @param {{ id: string, role: string }} user
 * @returns {string} Jeton de session, valable `JWT_EXPIRES_IN`.
 */
function signSession(user) {
  return jwt.sign({ role: user.role }, jwtSecret, {
    subject: String(user.id),
    expiresIn: jwtExpiresIn,
  });
}

/**
 * @param {string} token
 * @returns {string|null} Identifiant du compte, ou `null` si le jeton est invalide ou expiré.
 */
function verifySession(token) {
  try {
    const payload = jwt.verify(token, jwtSecret);
    return payload.sub;
  } catch {
    return null;
  }
}

module.exports = {
  hashPassword,
  checkPassword,
  signSession,
  verifySession,
};
