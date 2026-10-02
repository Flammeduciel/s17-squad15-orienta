/* Construit une erreur que le middleware d'erreurs sait renvoyer au format
   `Error` du contrat : un statut HTTP, un code machine et un message lisible.

   Exemple : throw httpError(404, 'FORMATION_INTROUVABLE', 'Aucune formation ne correspond à cet identifiant.'); */
function httpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

module.exports = httpError;
