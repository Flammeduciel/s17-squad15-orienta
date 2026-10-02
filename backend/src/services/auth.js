/**
 * Mots de passe et jetons de la Squad.
 *
 * Deux sortes de jetons, signés avec `JWT_SECRET` :
 * - le **jeton de session**, renvoyé à la connexion et envoyé ensuite dans
 *   l'en-tête `Authorization: Bearer <jeton>` ;
 * - le **jeton de réinitialisation**, glissé dans le lien envoyé par e-mail. Il
 *   est aussi signé avec le hash du mot de passe actuel : dès que le mot de
 *   passe change, le lien ne fonctionne plus. Il ne sert donc qu'une fois.
 *
 * @module services/auth
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const BCRYPT_ROUNDS = 10;
const RESET_EXPIRES_IN = '1h';

/**
 * Hash comparé quand le nom d'utilisateur n'existe pas : la réponse prend alors
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
 * @param {{ id: number, role: string }} user
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
 * @returns {number|null} Identifiant du compte, ou `null` si le jeton est invalide ou expiré.
 */
function verifySession(token) {
  try {
    const payload = jwt.verify(token, jwtSecret);
    return payload.purpose ? null : Number(payload.sub);
  } catch {
    return null;
  }
}

/**
 * @param {{ id: number, password_hash: string }} user
 * @returns {string} Jeton de réinitialisation, valable une heure et une seule fois.
 */
function signResetToken(user) {
  return jwt.sign({ purpose: 'password-reset' }, jwtSecret + user.password_hash, {
    subject: String(user.id),
    expiresIn: RESET_EXPIRES_IN,
  });
}

/**
 * Lit l'identifiant du compte dans un jeton de réinitialisation, sans le
 * vérifier : il faut d'abord charger le compte pour connaître son hash.
 *
 * @param {string} token
 * @returns {number|null}
 */
function readResetSubject(token) {
  const payload = jwt.decode(token);
  return payload && payload.purpose === 'password-reset' ? Number(payload.sub) : null;
}

/**
 * @param {string} token
 * @param {{ password_hash: string }} user Compte désigné par le jeton.
 * @returns {boolean} Vrai si le jeton est authentique, non expiré et pas encore utilisé.
 */
function verifyResetToken(token, user) {
  try {
    const payload = jwt.verify(token, jwtSecret + user.password_hash);
    return payload.purpose === 'password-reset';
  } catch {
    return false;
  }
}

module.exports = {
  hashPassword,
  checkPassword,
  signSession,
  verifySession,
  signResetToken,
  readResetSubject,
  verifyResetToken,
};
