/**
 * Schémas de validation des routes `/admin/courses`.
 *
 * @module validators/courses
 */
const { z } = require("zod");
const { id, requiredText } = require("./common");

/** Paramètres de `GET /admin/courses`. */
const courseListQuery = z.object({
  q: z
    .string()
    .trim()
    .max(100, "ne doit pas dépasser 100 caractères.")
    .optional(),
  program_id: id.optional(),
});

/** Corps de `POST` et `PUT /admin/courses`. */
const courseBody = z
  .object({
    name: requiredText(200),
    programs: z
      .array(
        z.object({
          program_id: id,
          year: z
            .number({ error: "doit être un nombre entier." })
            .int("doit être un nombre entier.")
            .min(1, "doit être au moins 1."),
        }),
        { error: "doit être une liste de rattachements." },
      )
      .default([]),
  })
  .refine(
    (body) =>
      new Set(body.programs.map((p) => p.program_id)).size ===
      body.programs.length,
    {
      message: "une formation ne peut figurer qu’une fois.",
      path: ["programs"],
    },
  );

module.exports = { courseListQuery, courseBody };
