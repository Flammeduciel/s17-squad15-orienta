/**
 * Schéma de validation de `POST /contact`.
 *
 * @module validators/contact
 */
const { z } = require("zod");
const { id, requiredText } = require("./common");

const contactBody = z.object({
  program_id: z
    .number({ error: "est obligatoire et doit être un nombre entier." })
    .int("doit être un nombre entier.")
    .pipe(id),
  name: requiredText(100),
  email: z
    .string({ error: "est obligatoire." })
    .trim()
    .max(150, "ne doit pas dépasser 150 caractères.")
    .pipe(z.email({ error: "n'est pas une adresse e-mail valide." })),
  message: requiredText(2000),
});

module.exports = { contactBody };
