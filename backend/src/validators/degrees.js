/**
 * Schémas de validation des routes des diplômes.
 *
 * @module validators/degrees
 */
const { z } = require('zod');
const { requiredText } = require('./common');

/** Corps de la création et de la modification d'un diplôme. */
const degreeBody = z.object({
  name: requiredText(50),
  duration: z
    .number({ error: 'doit être un nombre entier entre 1 et 5.' })
    .int('doit être un nombre entier entre 1 et 5.')
    .min(1, 'doit être un nombre entier entre 1 et 5.')
    .max(5, 'doit être un nombre entier entre 1 et 5.'),
});

module.exports = { degreeBody };
