/**
 * Schémas de validation des routes des cours et de la question à un institut.
 *
 * @module validators/courses
 */
const { z } = require('zod');
const { id, requiredText } = require('./common');

const year = z
  .number({ error: "doit être un numéro d'année, à partir de 1." })
  .int("doit être un numéro d'année, à partir de 1.")
  .min(1, "doit être un numéro d'année, à partir de 1.");

/** Paramètres de recherche de `GET /admin/courses`. */
const coursesQuery = z.object({
  q: z.string().trim().optional(),
  program_id: id.optional(),
});

/** Corps de la création et de la modification d'un cours. */
const courseBody = z.object({
  name: requiredText(200),
  programs: z
    .array(z.object({ program_id: z.number({ error: 'doit être un identifiant numérique.' }).int(), year }), {
      error: 'doit être la liste des formations rattachées.',
    })
    .default([]),
});

/** Paramètres de `/admin/programs/:id/courses/:course_id`. */
const programCourseParams = z.object({ id, course_id: id });

/** Corps du rattachement d'un cours à une formation. */
const linkBody = z.object({ year });

/** Corps de `POST /contact`. */
const contactBody = z.object({
  program_id: z.number({ error: 'doit être un identifiant numérique.' }).int('doit être un identifiant numérique.'),
  name: requiredText(100),
  email: z.email({ error: "n'est pas une adresse e-mail valide." }),
  message: requiredText(2000),
});

module.exports = { coursesQuery, courseBody, programCourseParams, linkBody, contactBody };
