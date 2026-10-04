const httpError = require("../utils/httpError");
const { translatePgError } = require("../utils/pgErrors");
const degrees = require("../models/degrees");

const notFound = () =>
  httpError(
    404,
    "DIPLOME_INTROUVABLE",
    "Aucun diplôme ne correspond à cet identifiant.",
  );

/** `GET /degrees` : diplômes avec leur durée et le nombre de formations publiées. */
async function list(req, res) {
  res.json(await degrees.listPublic());
}

/** `POST /admin/degrees` : 201 avec le diplôme créé. */
async function create(req, res) {
  const { name } = req.valid.body;
  try {
    res.status(201).json(await degrees.create(req.valid.body));
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `Un diplôme nommé « ${name} » existe déjà.`,
    });
  }
}

/**
 * `PUT /admin/degrees/:id` : 200. Changer `duration` ajuste les formations du
 * diplôme (frais et cours) dans une transaction.
 */
async function update(req, res) {
  const { name } = req.valid.body;
  let degree;
  try {
    degree = await degrees.updateWithPrograms(
      req.valid.params.id,
      req.valid.body,
    );
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `Un diplôme nommé « ${name} » existe déjà.`,
    });
  }
  if (!degree) throw notFound();
  res.json(degree);
}

/** `DELETE /admin/degrees/:id` : 204, ou 409 tant qu'une formation le délivre. */
async function remove(req, res) {
  const { id } = req.valid.params;
  const degree = await degrees.findById(id);
  if (!degree) throw notFound();

  const n = degree.program_count;
  if (n > 0) {
    throw httpError(
      409,
      "ELEMENT_UTILISE",
      `« ${degree.name} » est utilisé par ${n} formation${n > 1 ? "s" : ""} : modifiez-${n > 1 ? "les" : "la"} d'abord.`,
    );
  }
  try {
    await degrees.remove(id);
  } catch (error) {
    // Filet de sécurité : formation créée entre le comptage et la suppression.
    throw translatePgError(error, {
      inUse: `« ${degree.name} » est encore utilisé par une formation.`,
    });
  }
  res.status(204).end();
}

module.exports = { list, create, update, remove };
