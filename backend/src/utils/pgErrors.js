const httpError = require("./httpError");

/**
 * Convertit une erreur PostgreSQL en erreur 409 au format du contrat.
 * Toute autre erreur est renvoyée telle quelle (le gestionnaire d'erreurs
 * la journalisera en 500).
 *
 * - `23505` : doublon sur une colonne UNIQUE.
 * - `23503` : clé étrangère (élément encore référencé).
 *
 * @param {Error & { code?: string }} error Erreur interceptée.
 * @param {{ duplicate?: string, inUse?: string }} [messages] Messages en français.
 * @returns {Error}
 *
 * @example
 * try { await model.create(data); } catch (e) { throw translatePgError(e, { duplicate: 'Ce nom existe déjà.' }); }
 */
function translatePgError(error, messages = {}) {
  if (error && error.code === "23505") {
    return httpError(
      409,
      "NOM_DEJA_UTILISE",
      messages.duplicate || "Cet élément existe déjà.",
    );
  }
  if (error && error.code === "23503") {
    return httpError(
      409,
      "ELEMENT_UTILISE",
      messages.inUse || "Cet élément est encore utilisé.",
    );
  }
  return error;
}

module.exports = { translatePgError };
