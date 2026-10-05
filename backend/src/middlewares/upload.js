const multer = require("multer");
const httpError = require("../utils/httpError");
const env = require("../config/env");

/** Taille maximale d'une image : 2 Mo par défaut. */
const MAX_BYTES = env.maxUploadBytes || 2 * 1024 * 1024;

const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
}).single("file");

/**
 * Lit le champ multipart `file`. Les erreurs de multer n'ont pas de `status` :
 * on les convertit en 400 au format commun, sinon elles finiraient en 500.
 *
 * @type {import('express').RequestHandler}
 */
function receiveImage(req, res, next) {
  parser(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      const mb = Math.floor(MAX_BYTES / (1024 * 1024));
      return next(
        httpError(
          400,
          "PARAMETRE_INVALIDE",
          `« file » : ne doit pas dépasser ${mb} Mo.`,
        ),
      );
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        httpError(
          400,
          "PARAMETRE_INVALIDE",
          "« file » : le fichier doit être envoyé dans le champ « file ».",
        ),
      );
    }
    return next(error);
  });
}

module.exports = { receiveImage };
