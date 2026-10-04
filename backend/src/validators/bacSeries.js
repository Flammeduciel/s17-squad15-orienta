/**
 * Schémas de validation des routes des séries du bac.
 *
 * @module validators/bacSeries
 */
const { z } = require('zod');
const { requiredText } = require('./common');

/** Corps de la création et de la modification d'une série. Le libellé est facultatif. */
const bacSeriesBody = z.object({
  code: requiredText(10),
  label: z
    .string({ error: 'doit être un texte.' })
    .trim()
    .max(100, 'ne doit pas dépasser 100 caractères.')
    .nullish()
    .transform((value) => value || null),
});

module.exports = { bacSeriesBody };
