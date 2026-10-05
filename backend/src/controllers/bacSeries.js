const httpError = require("../utils/httpError");
const { translatePgError } = require("../utils/pgErrors");
const bacSeries = require("../models/bacSeries");

const notFound = () =>
  httpError(
    404,
    "SERIE_INTROUVABLE",
    "Aucune série ne correspond à cet identifiant.",
  );

/** `GET /bac-series` : 200, tableau `[{ id, code, label }]` trié par code. */
async function list(req, res) {
  res.json(await bacSeries.list());
}

/** `POST /admin/bac-series` : 201 avec la série créée. */
async function create(req, res) {
  const { code, label } = req.valid.body;
  try {
    res.status(201).json(await bacSeries.create({ code, label }));
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `La série « ${code} » existe déjà.`,
    });
  }
}

/** `PUT /admin/bac-series/:id` : 200 avec la série mise à jour. */
async function update(req, res) {
  const { code, label } = req.valid.body;
  let series;
  try {
    series = await bacSeries.update(req.valid.params.id, { code, label });
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `La série « ${code} » existe déjà.`,
    });
  }
  if (!series) throw notFound();
  res.json(series);
}

/** `DELETE /admin/bac-series/:id` : 204, ou 409 tant qu'une formation l'admet. */
async function remove(req, res) {
  const { id } = req.valid.params;
  const series = await bacSeries.findById(id);
  if (!series) throw notFound();

  const total = await bacSeries.countPrograms(id);
  if (total > 0) {
    throw httpError(
      409,
      "ELEMENT_UTILISE",
      `« ${series.code} » est utilisée par ${total} formation${total > 1 ? "s" : ""} : modifiez-les d'abord.`,
    );
  }
  try {
    await bacSeries.remove(id);
  } catch (error) {
    // Filet de sécurité : rattachement créé entre le comptage et la suppression.
    throw translatePgError(error, {
      inUse: `« ${series.code} » est encore utilisée par une formation.`,
    });
  }
  res.status(204).end();
}

module.exports = { list, create, update, remove };
