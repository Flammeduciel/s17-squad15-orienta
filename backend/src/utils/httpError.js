/**
 * Construit une erreur que le middleware d'erreurs sait renvoyer au format
 * `Error` du contrat d'API.
 *
 * @param {number} status Statut HTTP de la réponse (400, 404, 409…).
 * @param {string} code Code machine stable, en majuscules (`FORMATION_INTROUVABLE`).
 * @param {string} message Message lisible, en français, destiné au client.
 * @returns {Error & { status: number, code: string }}
 *
 * @example
 * throw httpError(404, 'FORMATION_INTROUVABLE', 'Aucune formation ne correspond à cet identifiant.');
 */
function httpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

module.exports = httpError;
