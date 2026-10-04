const httpError = require("../utils/httpError");
const institutes = require("../models/institutes");

/**
 * `GET /institutes` : 200, `{ total, items }`.
 *
 * @param {import('express').Request} req `req.valid.query` : filtres validés.
 * @param {import('express').Response} res
 */
async function list(req, res) {
  const items = await institutes.list(req.valid.query);
  res.json({ total: items.length, items });
}

/**
 * `GET /institutes/:id` : 200 avec la fiche, ou 404.
 *
 * `programs` reste vide tant que BK5 n'est pas livré : la liste des formations
 * publiées de l'institut (`ProgramSummary`) lui appartient.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function get(req, res) {
  const institute = await institutes.findById(req.valid.params.id);
  if (!institute) {
    throw httpError(
      404,
      "INSTITUT_INTROUVABLE",
      "Aucun institut ne correspond à cet identifiant.",
    );
  }
  res.json({ ...institute, programs: [] });
}

module.exports = { list, get };
