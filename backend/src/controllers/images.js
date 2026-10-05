const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const httpError = require("../utils/httpError");
const { detectImageExtension } = require("../utils/imageType");
const { uploadDir } = require("../config/env");

/**
 * `POST /admin/images` : 201 `{ url }`.
 * L'url est à mettre dans `image_url` d'un institut.
 *
 * @param {import('express').Request} req `req.file` : fichier reçu en mémoire.
 * @param {import('express').Response} res
 */
async function upload(req, res) {
  if (!req.file) {
    throw httpError(400, "PARAMETRE_INVALIDE", "« file » : est obligatoire.");
  }
  const extension = detectImageExtension(req.file.buffer);
  if (!extension) {
    throw httpError(
      400,
      "PARAMETRE_INVALIDE",
      "« file » : doit être une image JPEG, PNG ou WebP.",
    );
  }

  const dir = path.join(uploadDir, "institutes");
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  await fs.writeFile(path.join(dir, name), req.file.buffer, { flag: "wx" });

  res.status(201).json({ url: `/uploads/institutes/${name}` });
}

module.exports = { upload };
