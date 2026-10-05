const httpError = require("../utils/httpError");
const institutes = require("../models/institutes");

const notFound = () =>
  httpError(
    404,
    "INSTITUT_INTROUVABLE",
    "Aucun institut ne correspond à cet identifiant.",
  );

/** `programs` reste vide tant que BK5 n'est pas livré. */
const withPrograms = (institute) => ({ ...institute, programs: [] });

/**
 * Nom ou sigle déjà pris : 409 avec un message qui dit lequel.
 *
 * @param {Error & { code?: string, constraint?: string }} error
 * @param {{ name: string, short_name: string }} body
 * @returns {Error}
 */
function translateInstituteError(error, { name, short_name: shortName }) {
  if (error && error.code === "23505") {
    const message =
      error.constraint && error.constraint.includes("short_name")
        ? `Le sigle « ${shortName} » est déjà utilisé par un autre institut.`
        : `Un institut nommé « ${name} » existe déjà.`;
    return httpError(409, "NOM_DEJA_UTILISE", message);
  }
  return error;
}

/** `GET /institutes` : 200, `{ total, items }`. */
async function list(req, res) {
  const items = await institutes.list(req.valid.query);
  res.json({ total: items.length, items });
}

/** `GET /institutes/:id` : 200 avec la fiche, ou 404. */
async function get(req, res) {
  const institute = await institutes.findById(req.valid.params.id);
  if (!institute) throw notFound();
  res.json(withPrograms(institute));
}

/** `POST /admin/institutes` : 201 avec la fiche créée. */
async function create(req, res) {
  let id;
  try {
    id = await institutes.create(req.valid.body);
  } catch (error) {
    throw translateInstituteError(error, req.valid.body);
  }
  res.status(201).json(withPrograms(await institutes.findById(id)));
}

/** `PUT /admin/institutes/:id` : 200 avec la fiche mise à jour. */
async function update(req, res) {
  const { id } = req.valid.params;
  let found;
  try {
    found = await institutes.update(id, req.valid.body);
  } catch (error) {
    throw translateInstituteError(error, req.valid.body);
  }
  if (!found) throw notFound();
  res.json(withPrograms(await institutes.findById(id)));
}

/** `DELETE /admin/institutes/:id` : 204. Les formations de l'institut sont supprimées avec lui. */
async function remove(req, res) {
  if (!(await institutes.remove(req.valid.params.id))) throw notFound();
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };
