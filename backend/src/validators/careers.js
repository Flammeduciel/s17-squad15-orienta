/**
 * Schémas de validation des routes des débouchés.
 *
 * @module validators/careers
 */
const { z } = require('zod');
const { requiredText } = require('./common');

/** Corps de la création et de la modification d'un débouché. */
const careerBody = z.object({
  name: requiredText(100),
  domain_id: requiredText(20),
});

module.exports = { careerBody };
