/**
 * Schémas de validation des routes `/auth`.
 *
 * @module validators/auth
 */
const { z } = require('zod');
const { requiredText } = require('./common');

/** Corps de `POST /auth/login`. */
const loginBody = z.object({
  username: requiredText(50),
  password: z.string({ error: 'est obligatoire.' }).min(1, 'est obligatoire.'),
});

/** Corps de `POST /auth/password-reset`. */
const resetRequestBody = z.object({
  email: z.email({ error: "n'est pas une adresse e-mail valide." }),
});

/**
 * Corps de `POST /auth/password-reset/confirm`. bcrypt ne tient compte que des
 * 72 premiers octets d'un mot de passe : au-delà, on refuse plutôt que de
 * tronquer en silence.
 */
const resetConfirmBody = z.object({
  token: z.string({ error: 'est obligatoire.' }).min(1, 'est obligatoire.'),
  password: z
    .string({ error: 'est obligatoire.' })
    .min(8, 'doit compter au moins 8 caractères.')
    .refine((value) => Buffer.byteLength(value) <= 72, 'ne doit pas dépasser 72 octets.'),
});

module.exports = { loginBody, resetRequestBody, resetConfirmBody };
