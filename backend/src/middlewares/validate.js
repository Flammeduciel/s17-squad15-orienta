const httpError = require('../utils/httpError');

/**
 * Schémas zod à appliquer à une requête. Chaque partie est facultative.
 *
 * @typedef {object} RequestSchemas
 * @property {import('zod').ZodType} [params] Paramètres de l'URL (`/programs/:id`).
 * @property {import('zod').ZodType} [query] Paramètres de recherche (`?evening=true`).
 * @property {import('zod').ZodType} [body] Corps JSON de la requête.
 */

/**
 * Fabrique un middleware qui valide une requête avant le contrôleur.
 *
 * Chaque partie fournie est contrôlée et convertie. Les valeurs propres sont
 * posées dans `req.valid` : le contrôleur lit `req.valid.params.id` (déjà un
 * nombre), jamais `req.params.id`.
 *
 * À la première entrée invalide, la requête s'arrête en 400
 * `PARAMETRE_INVALIDE`, avec le nom du champ fautif dans le message.
 *
 * @param {RequestSchemas} schemas
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.get('/programs/:id', validate({ params: idParams }), getProgram);
 */
function validate(schemas) {
  return (req, res, next) => {
    const valid = {};
    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part] ?? {});
      if (!result.success) {
        const issue = result.error.issues[0];
        const field = issue.path.join('.');
        const message = field ? `« ${field} » : ${issue.message}` : issue.message;
        return next(httpError(400, 'PARAMETRE_INVALIDE', message));
      }
      valid[part] = result.data;
    }
    req.valid = valid;
    return next();
  };
}

module.exports = validate;
