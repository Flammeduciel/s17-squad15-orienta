const httpError = require('../utils/httpError');
const { verifySession } = require('../services/auth');
const users = require('../models/users');

/**
 * Exige une session Squad valide : en-tête `Authorization: Bearer <jeton>`.
 *
 * Le compte est relu en base à chaque requête : un compte supprimé perd
 * immédiatement l'accès, même avec un jeton encore valide. Le compte est posé
 * dans `req.user` (sans son hash de mot de passe).
 *
 * Sinon, la requête s'arrête en 401 `NON_AUTORISE`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('Authorization') || '').split(' ');
  const userId = scheme === 'Bearer' && token ? verifySession(token) : null;
  const user = userId ? await users.findById(userId) : null;
  if (!user) {
    return next(httpError(401, 'NON_AUTORISE', 'Authentification Squad requise.'));
  }
  const { password_hash: _hash, ...safeUser } = user;
  req.user = safeUser;
  return next();
}

module.exports = { requireAuth };
