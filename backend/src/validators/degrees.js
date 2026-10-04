/**
 * Schémas de validation des routes `/degrees` et `/admin/degrees`.
 *
 * @module validators/degrees
 */
const { z } = require("zod");
const { requiredText } = require("./common");

/** Corps de `POST` et `PUT /admin/degrees`. */
const degreeBody = z.object({
  name: requiredText(50),
  duration: z
    .number({ error: "doit être un nombre entier." })
    .int("doit être un nombre entier.")
    .min(1, "doit être compris entre 1 et 5.")
    .max(5, "doit être compris entre 1 et 5."),
});

module.exports = { degreeBody };
