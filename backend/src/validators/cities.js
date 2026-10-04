/**
 * Schémas de validation des routes des villes et des arrondissements.
 *
 * @module validators/cities
 */
const { z } = require('zod');
const { id, requiredText } = require('./common');

/** Corps de la création et de la modification d'une ville. */
const cityBody = z.object({
  name: requiredText(100),
});

/** Corps de la création et de la modification d'un arrondissement. */
const districtBody = z.object({
  name: requiredText(100),
  city_id: id,
});

module.exports = { cityBody, districtBody };
