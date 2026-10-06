const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const multer = require('multer');
const httpError = require('../utils/httpError');
const { uploadDir, maxUploadBytes } = require('../config/env');

/* Formats acceptés (EX-04) et extension donnée au fichier enregistré. */
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const instituteDir = path.join(uploadDir, 'institutes');

const storage = multer.diskStorage({
  destination: (req, file, done) => {
    fs.mkdirSync(instituteDir, { recursive: true });
    done(null, instituteDir);
  },
  // Le nom d'origine n'est jamais repris : on en fabrique un, impossible à deviner.
  filename: (req, file, done) => {
    done(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxUploadBytes, files: 1 },
  fileFilter: (req, file, done) => {
    if (!EXTENSIONS[file.mimetype]) {
      return done(httpError(400, 'FICHIER_INVALIDE', 'Format non accepté : utilisez JPEG, PNG ou WebP.'));
    }
    return done(null, true);
  },
}).single('file');

/**
 * Reçoit une image d'institut envoyée en `multipart/form-data` (champ `file`)
 * et l'enregistre dans `uploads/institutes/`. Le fichier est ensuite dans
 * `req.file`.
 *
 * Un format refusé ou une image trop lourde répond 400 `FICHIER_INVALIDE`.
 *
 * @type {import('express').RequestHandler}
 */
function uploadInstituteImage(req, res, next) {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? `Image trop lourde : ${Math.round(maxUploadBytes / 1024 / 1024)} Mo maximum.`
          : "Envoyez une seule image, dans le champ « file ».";
      return next(httpError(400, 'FICHIER_INVALIDE', message));
    }
    return next(error);
  });
}

module.exports = { uploadInstituteImage };
