/**
 * Schémas de validation des routes `/domains` et `/admin/domains`.
 *
 * @module validators/domains
 */
const { z } = require("zod");
const { requiredText } = require("./common");

/** Paramètre `:id` : le slug du domaine (`sante`, `gestion-finance`…), pas un entier. */
const domainIdParams = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]{1,20}$/, "doit être un identifiant de domaine valide."),
});

/** Corps de `POST` et `PUT /admin/domains`. */
const domainBody = z.object({
  name: requiredText(100),
  color: z
    .string({ error: "est obligatoire." })
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "doit être une couleur hexadécimale au format #RRGGBB.",
    )
    .transform((value) => value.toUpperCase()),
});

module.exports = { domainIdParams, domainBody };
