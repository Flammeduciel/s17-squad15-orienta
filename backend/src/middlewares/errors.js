const httpError = require('../utils/httpError');

/* Aucune route n'a répondu : on le dit au format du contrat. */
function notFound(req, res, next) {
  next(httpError(404, 'ROUTE_INTROUVABLE', "Cette route n'existe pas."));
}

/* Dernier middleware de l'application : toute erreur arrive ici et repart au
   format `Error` du contrat. Seules les erreurs levées avec `httpError` portent
   un message destiné au client ; les autres sont journalisées et ne révèlent
   aucun détail. Express reconnaît ce middleware à ses quatre paramètres :
   `next` doit rester dans la signature même s'il n'est pas utilisé. */
function errorHandler(error, req, res, next) {
  if (error.code && error.status) {
    return res.status(error.status).json({ code: error.code, message: error.message });
  }
  /* Corps de requête illisible (JSON mal formé), signalé par express.json(). */
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      code: 'REQUETE_INVALIDE',
      message: "Le corps de la requête n'est pas un JSON valide.",
    });
  }
  console.error(error);
  return res.status(500).json({ code: 'ERREUR_INTERNE', message: 'Une erreur est survenue.' });
}

module.exports = { notFound, errorHandler };
