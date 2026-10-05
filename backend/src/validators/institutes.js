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
 * durée, budget, série, cours du soir, stage, tranches) sont validés ici et
 * appliqués par le contrôleur, à partir de la recherche des formations.
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


const { requiredText } = require("./common");

const optionalText = (max) =>
  z
    .string({ error: "doit être un texte." })
    .trim()
    .max(max, `ne doit pas dépasser ${max} caractères.`)
    .nullish()
    .transform((value) => value || null);

const isoDate = z
  .string({ error: "doit être une date au format AAAA-MM-JJ." })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "doit être une date au format AAAA-MM-JJ.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "doit être une date valide.");

/** Corps de `POST` et `PUT /admin/institutes`. */
const instituteBody = z
  .object({
    name: requiredText(200),
    short_name: requiredText(20),
    district: z.enum(DISTRICTS, {
      error: "doit être l'un des 9 arrondissements de Brazzaville.",
    }),
    address: requiredText(300),
    phone: requiredText(20),
    whatsapp: z
      .string({ error: "est obligatoire." })
      .trim()
      .regex(
        /^\d{8,20}$/,
        "doit être un numéro international en chiffres, sans « + ».",
      ),
    email: z
      .string()
      .trim()
      .max(150, "ne doit pas dépasser 150 caractères.")
      .nullish()
      .transform((value) => value || null)
      .pipe(
        z.email({ error: "n'est pas une adresse e-mail valide." }).nullable(),
      ),
    color: z
      .string()
      .regex(
        /^#[0-9A-Fa-f]{6}$/,
        "doit être une couleur hexadécimale au format #RRGGBB.",
      )
      .transform((value) => value.toUpperCase())
      .nullish()
      .transform((value) => value || null),
    image_url: z
      .string()
      .regex(
        /^\/uploads\/[A-Za-z0-9._\/-]+$/,
        "doit être une image déposée via /admin/images.",
      )
      .nullish()
      .transform((value) => value || null),
    description: optionalText(5000),
    benefits: z
      .array(requiredText(100), { error: "doit être une liste de textes." })
      .max(20, "ne doit pas dépasser 20 avantages.")
      .default([]),
    registration_fee: z
      .number({ error: "doit être un nombre entier positif." })
      .int("doit être un nombre entier positif.")
      .min(0, "doit être un nombre entier positif."),
    registration_deadline: isoDate
      .nullish()
      .transform((value) => value ?? null),
    start_date: isoDate.nullish().transform((value) => value ?? null),
    accreditation_number: optionalText(100),
  })
  .refine(
    (d) =>
      !d.registration_deadline ||
      !d.start_date ||
      d.start_date >= d.registration_deadline,
    {
      message: "ne peut pas précéder la clôture des inscriptions.",
      path: ["start_date"],
    },
  );

module.exports = { instituteListQuery, instituteBody };


