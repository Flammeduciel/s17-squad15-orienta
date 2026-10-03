const httpError = require('../utils/httpError');

/**
 * Répond quand aucune route n'a pris la requête, au format du contrat.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function notFound(req, res, next) {
  next(httpError(404, 'ROUTE_INTROUVABLE', "Cette route n'existe pas."));
}

/**
 * Erreurs levées par `express.json()` avant même d'atteindre une route :
 * type d'erreur → [statut, code, message].
 *
 * @type {Record<string, [number, string, string]>}
 */
const bodyErrors = {
  'entity.parse.failed': [400, 'REQUETE_INVALIDE', "Le corps de la requête n'est pas un JSON valide."],
  'entity.too.large': [413, 'REQUETE_TROP_LOURDE', 'Le corps de la requête est trop volumineux.'],
};

/**
 * Dernier middleware de l'application : toute erreur arrive ici et repart au
 * format `Error` du contrat (`code` + `message`).
 *
 * Seules les erreurs levées avec `httpError` portent un message destiné au
 * client ; les autres sont journalisées et ne révèlent aucun détail.
 *
 * Express reconnaît ce middleware à ses quatre paramètres : `next` doit rester
 * dans la signature même s'il n'est pas utilisé.
 *
 * @param {Error & { status?: number, code?: string, type?: string }} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(error, req, res, next) {
  if (error.code && error.status) {
    return res.status(error.status).json({ code: error.code, message: error.message });
  }
  if (bodyErrors[error.type]) {
    const [status, code, message] = bodyErrors[error.type];
    return res.status(status).json({ code, message });
  }
  console.error(error);
  return res.status(500).json({ code: 'ERREUR_INTERNE', message: 'Une erreur est survenue.' });
}

module.exports = { notFound, errorHandler };
