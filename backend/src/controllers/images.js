const httpError = require('../utils/httpError');

/**
 * `POST /admin/images` — enregistre l'image d'un institut et renvoie son
 * adresse, à mettre ensuite dans `image_url` de l'institut.
 *
 * @param {import('express').Request} req `req.file` : le fichier enregistré par le middleware d'upload.
 * @param {import('express').Response} res 201 `{ url }`.
 */
function uploadImage(req, res) {
  if (!req.file) {
    throw httpError(400, 'FICHIER_INVALIDE', "Aucune image reçue : envoyez-la dans le champ « file ».");
  }
  res.status(201).json({ url: `/uploads/institutes/${req.file.filename}` });
}

module.exports = { uploadImage };
