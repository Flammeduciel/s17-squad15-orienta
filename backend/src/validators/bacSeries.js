/**
 * Schémas de validation des routes `/bac-series` et `/admin/bac-series`.
 *
 * @module validators/bacSeries
 */
const { z } = require("zod");
const { requiredText } = require("./common");

/** Corps de `POST` et `PUT /admin/bac-series`. Le code est enregistré en majuscules. */
const bacSeriesBody = z.object({
  code: requiredText(10).transform((value) => value.toUpperCase()),
  label: z
    .string({ error: "doit être un texte." })
    .trim()
    .max(100, "ne doit pas dépasser 100 caractères.")
    .nullish()
    .transform((value) => value || null),
});

module.exports = { bacSeriesBody };
