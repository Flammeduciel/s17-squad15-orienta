/**
 * Schémas de validation des routes des instituts.
 *
 * @module validators/institutes
 */
const { z } = require('zod');
const { requiredText, booleanQuery } = require('./common');
const DISTRICTS = require('../utils/districts');

const district = z.enum(DISTRICTS, { error: 'doit être un des 9 arrondissements de Brazzaville.' });

/** Texte facultatif : absent, vide ou `null` deviennent `null`. */
const optionalText = (max) =>
  z
    .string({ error: 'doit être un texte.' })
    .trim()
    .max(max, `ne doit pas dépasser ${max} caractères.`)
    .nullish()
    .transform((value) => value || null);

/** Date facultative au format `AAAA-MM-JJ`. */
const optionalDate = z.iso
  .date({ error: 'doit être une date au format AAAA-MM-JJ.' })
  .nullish()
  .transform((value) => value || null);

/** Paramètres de recherche de `GET /institutes`. */
const institutesQuery = z.object({
  q: z.string().trim().optional(),
  district: district.optional(),
  accredited: booleanQuery,
});

/** Corps de la création et de la modification d'un institut. */
const instituteBody = z
  .object({
    name: requiredText(200),
    short_name: requiredText(20),
    district,
    address: requiredText(300),
    phone: requiredText(20),
    whatsapp: z
      .string({ error: 'est obligatoire.' })
      .trim()
      .regex(/^[0-9]{8,20}$/, 'doit être un numéro international en chiffres, sans le +.'),
    email: z
      .email({ error: "n'est pas une adresse e-mail valide." })
      .nullish()
      .transform((value) => value || null),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'doit être une couleur au format #RRGGBB.')
      .nullish()
      .transform((value) => value || null),
    image_url: optionalText(500),
    description: optionalText(2000),
    benefits: z.array(requiredText(200), { error: 'doit être une liste de textes.' }).default([]),
    registration_fee: z
      .number({ error: 'doit être un nombre entier positif.' })
      .int('doit être un nombre entier positif.')
      .min(0, 'doit être un nombre entier positif.'),
    registration_deadline: optionalDate,
    start_date: optionalDate,
    accreditation_number: optionalText(100),
  })
  // Une rentrée avant la clôture des inscriptions n'a pas de sens.
  .refine(
    (institute) =>
      !institute.registration_deadline ||
      !institute.start_date ||
      institute.start_date >= institute.registration_deadline,
    { path: ['start_date'], message: 'ne peut pas précéder la clôture des inscriptions.' },
  );

module.exports = { institutesQuery, instituteBody };
