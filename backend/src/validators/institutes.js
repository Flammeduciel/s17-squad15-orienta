/**
 * Schémas de validation des routes `/institutes`.
 *
 * @module validators/institutes
 */
const { z } = require("zod");
const { id, booleanQuery, positiveIntQuery } = require("./common");
const { DISTRICTS } = require("../models/districts");

/**
 * Paramètres de `GET /institutes`.
 *
 * Les filtres qui portent sur les formations (domaine, diplôme, débouché,
 * durée, budget, série, cours du soir, stage, tranches) sont validés ici mais
 * appliqués par le bloc BK5.
 */
const instituteListQuery = z.object({
  q: z
    .string()
    .trim()
    .max(100, "ne doit pas dépasser 100 caractères.")
    .optional(),
  district: z
    .enum(DISTRICTS, {
      error: "doit être l'un des 9 arrondissements de Brazzaville.",
    })
    .optional(),
  accredited: booleanQuery,
  domain_id: z
    .string()
    .regex(/^[a-z0-9-]{1,20}$/, "doit être un identifiant de domaine valide.")
    .optional(),
  degree_id: id.optional(),
  career_id: id.optional(),
  duration: z.coerce
    .number({ error: "doit être un nombre entier." })
    .int("doit être un nombre entier.")
    .min(1, "doit être compris entre 1 et 5.")
    .max(5, "doit être compris entre 1 et 5.")
    .optional(),
  max_tuition: positiveIntQuery.optional(),
  bac_series: z
    .string()
    .trim()
    .max(10, "ne doit pas dépasser 10 caractères.")
    .optional(),
  evening: booleanQuery,
  internship: booleanQuery,
  installments: booleanQuery,
});

module.exports = { instituteListQuery };
