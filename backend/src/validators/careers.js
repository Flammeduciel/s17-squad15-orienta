/**
 * Schémas de validation des routes `/careers` et `/admin/careers`.
 *
 * @module validators/careers
 */
const { z } = require("zod");
const { requiredText } = require("./common");

/** Corps de `POST` et `PUT /admin/careers`. */
const careerBody = z.object({
  name: requiredText(100),
  domain_id: z
    .string({ error: "est obligatoire." })
    .regex(/^[a-z0-9-]{1,20}$/, "doit être un identifiant de domaine valide."),
});

module.exports = { careerBody };
