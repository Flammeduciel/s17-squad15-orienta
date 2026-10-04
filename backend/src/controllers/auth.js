const httpError = require('../utils/httpError');
const users = require('../models/users');
const auth = require('../services/auth');
const { sendMail } = require('../services/mail');
const { backofficeUrl } = require('../config/env');

/**
 * `POST /auth/login` — ouvre une session Squad (EX-16).
 *
 * Le message d'échec est le même que le nom d'utilisateur soit inconnu ou le
 * mot de passe faux : il ne révèle pas quels comptes existent.
 *
 * @param {import('express').Request} req `req.valid.body` : `{ username, password }`.
 * @param {import('express').Response} res 200 `{ token, name, role }`.
 * @returns {Promise<void>}
 */
async function login(req, res) {
  const { username, password } = req.valid.body;
  const user = await users.findByUsername(username);
  const ok = await auth.checkPassword(password, user ? user.password_hash : null);
  if (!ok) {
    throw httpError(401, 'IDENTIFIANTS_INVALIDES', 'Identifiant ou mot de passe incorrect.');
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

/**
 * `POST /auth/password-reset` — envoie un lien de réinitialisation (EX-17).
 *
 * Répond toujours 202, que l'adresse corresponde à un compte ou non : la
 * réponse ne révèle pas quelles adresses sont inscrites. Le lien est envoyé à
 * l'adresse enregistrée, jamais le mot de passe lui-même.
 *
 * @param {import('express').Request} req `req.valid.body` : `{ email }`.
 * @param {import('express').Response} res 202.
 * @returns {Promise<void>}
 */
async function requestPasswordReset(req, res) {
  const user = await users.findByEmail(req.valid.body.email);
  if (user) {
    const link = `${backofficeUrl}/reinitialiser-mot-de-passe?token=${auth.signResetToken(user)}`;
    await sendMail({
      to: user.email,
      subject: 'Orienta — réinitialisation de votre mot de passe',
      text: `Bonjour ${user.name},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien dans l'heure :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.`,
    });
  }
  res.status(202).end();
}

/**
 * `POST /auth/password-reset/confirm` — enregistre le nouveau mot de passe.
 *
 * Le lien ne sert qu'une fois : une fois le mot de passe changé, le même jeton
 * est refusé.
 *
 * @param {import('express').Request} req `req.valid.body` : `{ token, password }`.
 * @param {import('express').Response} res 204, ou 400 `LIEN_INVALIDE`.
 * @returns {Promise<void>}
 */
async function confirmPasswordReset(req, res) {
  const { token, password } = req.valid.body;
  const userId = auth.readResetSubject(token);
  const user = userId ? await users.findById(userId) : null;
  if (!user || !auth.verifyResetToken(token, user)) {
    throw httpError(400, 'LIEN_INVALIDE', 'Ce lien de réinitialisation est invalide ou a expiré.');
  }
  await users.updatePassword(user.id, await auth.hashPassword(password));
  res.status(204).end();
}

module.exports = { login, logout, requestPasswordReset, confirmPasswordReset };
