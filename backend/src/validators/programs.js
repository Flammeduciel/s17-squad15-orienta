/**
 * Schémas de validation des routes des formations.
 *
 * @module validators/programs
 */
const { z } = require('zod');
const { id, booleanQuery, positiveIntQuery, requiredText, optionalText } = require('./common');
const { DISTRICTS } = require('../models/districts');

/** Identifiant d'un domaine : un slug, comme `sante`. */
const domainId = z.string().regex(/^[a-z0-9-]{1,20}$/, 'doit être un identifiant de domaine valide.');

/** Paramètres de recherche de `GET /programs` : les mêmes critères que `GET /institutes`, plus le tri. */
const programsQuery = z.object({
  q: z.string().trim().max(100, 'ne doit pas dépasser 100 caractères.').optional(),
  domain_id: domainId.optional(),
  district: z.enum(DISTRICTS, { error: "doit être l'un des 9 arrondissements de Brazzaville." }).optional(),
  degree_id: id.optional(),
  career_id: id.optional(),
  duration: positiveIntQuery.optional(),
  max_tuition: positiveIntQuery.optional(),
  bac_series: z.string().trim().max(10, 'ne doit pas dépasser 10 caractères.').optional(),
  evening: booleanQuery,
  internship: booleanQuery,
  installments: booleanQuery,
  sort: z
    .enum(['relevance', 'tuition_asc', 'tuition_desc', 'duration'], {
      error: 'doit valoir relevance, tuition_asc, tuition_desc ou duration.',
    })
    .default('relevance'),
});

/** Paramètres de recherche de `GET /admin/programs`. */
const adminProgramsQuery = z.object({
  q: z.string().trim().max(100, 'ne doit pas dépasser 100 caractères.').optional(),
  domain_id: domainId.optional(),
  status: z.enum(['published', 'draft'], { error: 'doit valoir published ou draft.' }).optional(),
});

const wholeNumber = (message) => z.number({ error: message }).int(message);

/** Corps de la création et de la modification d'une formation. */
const programBody = z.object({
  name: requiredText(200),
  institute_id: wholeNumber('doit être un identifiant numérique.'),
  domain_id: domainId,
  degree_id: wholeNumber('doit être un identifiant numérique.'),
  description: optionalText(2000),
  admission_requirements: optionalText(500),
  fees: z
    .array(wholeNumber('doit contenir des montants entiers.').min(1, 'doit contenir des montants supérieurs à zéro.'), {
      error: 'doit être la liste des frais, un montant par année.',
    })
    .min(1, 'doit contenir un montant par année.'),
  bac_series_ids: z.array(wholeNumber('doit contenir des identifiants.'), { error: 'doit être une liste.' }).default([]),
  career_ids: z
    .array(wholeNumber('doit contenir des identifiants.'), { error: 'doit être une liste.' })
    .min(1, 'doit contenir au moins un débouché.'),
  evening: z.boolean({ error: 'doit valoir true ou false.' }).default(false),
  internship_months: wholeNumber('doit être un nombre de mois entre 0 et 12.')
    .min(0, 'doit être un nombre de mois entre 0 et 12.')
    .max(12, 'doit être un nombre de mois entre 0 et 12.')
    .default(0),
  installments: z.boolean({ error: 'doit valoir true ou false.' }).default(false),
  status: z.enum(['published', 'draft'], { error: 'doit valoir published ou draft.' }).default('published'),
});

module.exports = { programsQuery, adminProgramsQuery, programBody };
