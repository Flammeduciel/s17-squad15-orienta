/**
 * Briques de validation communes à toutes les ressources. Les validateurs d'une
 * ressource (`validators/programs.js`, `validators/institutes.js`…) les
 * réutilisent. Les messages sont en français : ils sont renvoyés tels quels au
 * client.
 *
 * @module validators/common
 */
const { z } = require('zod');

/**
 * Identifiant d'une ligne en base : un UUID, comme
 * `3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d`. Toute autre valeur est refusée.
 */
const id = z.uuid({ error: 'doit être un identifiant valide (UUID).' });

/** Paramètres d'une route `/…/:id`. */
const idParams = z.object({ id });

/**
 * Booléen de filtre dans l'URL : `?evening=true`.
 * Absent, il vaut `false`.
 */
const booleanQuery = z
  .enum(['true', 'false'], { error: 'doit valoir true ou false.' })
  .default('false')
  .transform((value) => value === 'true');

/** Entier positif ou nul de filtre dans l'URL : `?max_tuition=500000`. */
const positiveIntQuery = z.coerce
  .number({ error: 'doit être un nombre entier positif.' })
  .int('doit être un nombre entier positif.')
  .min(0, 'doit être un nombre entier positif.');

/**
 * Liste de valeurs de filtre dans l'URL, séparées par des virgules :
 * `?duration=2,3` devient `[2, 3]`. Une seule valeur donne une liste d'un élément.
 *
 * @param {import('zod').ZodType} item Schéma de chaque valeur.
 *
 * @example
 * const query = z.object({ degree_id: listQuery(id).optional() });
 */
const listQuery = (item) =>
  z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(item));

/**
 * Texte obligatoire d'un corps de requête, débarrassé des espaces autour.
 *
 * @param {number} max Longueur maximale, celle de la colonne en base.
 * @returns {import('zod').ZodString}
 *
 * @example
 * const body = z.object({ name: requiredText(200) });
 */
const requiredText = (max) =>
  z
    .string({ error: 'est obligatoire.' })
    .trim()
    .min(1, 'est obligatoire.')
    .max(max, `ne doit pas dépasser ${max} caractères.`);

/**
 * Texte facultatif : absent, vide ou `null` deviennent `null`.
 *
 * @param {number} max Longueur maximale.
 */
const optionalText = (max) =>
  z
    .string({ error: 'doit être un texte.' })
    .trim()
    .max(max, `ne doit pas dépasser ${max} caractères.`)
    .nullish()
    .transform((value) => value || null);

module.exports = { id, idParams, booleanQuery, positiveIntQuery, listQuery, requiredText, optionalText };
