/**
 * Schémas de validation des routes `/auth`.
 *
 * @module validators/auth
 */
const { z } = require('zod');

/** Corps de `POST /auth/login`. */
const loginBody = z.object({
  email: z.email({ error: "n'est pas une adresse e-mail valide." }),
  password: z.string({ error: 'est obligatoire.' }).min(1, 'est obligatoire.'),
});

module.exports = { loginBody };
