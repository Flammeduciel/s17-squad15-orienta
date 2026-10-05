const httpError = require("../utils/httpError");
const { translatePgError } = require("../utils/pgErrors");
const careers = require("../models/careers");
const domains = require("../models/domains");

const notFound = () =>
  httpError(
    404,
    "DEBOUCHE_INTROUVABLE",
    "Aucun débouché ne correspond à cet identifiant.",
  );

/**
 * Refuse un `domain_id` qui n'existe pas, avec un message clair plutôt
 * qu'une erreur de clé étrangère.
 *
 * @param {string} domainId
 * @returns {Promise<void>}
 */
async function assertDomainExists(domainId) {
  if (!(await domains.findById(domainId))) {
    throw httpError(
      400,
      "PARAMETRE_INVALIDE",
      "« domain_id » : ce domaine n'existe pas.",
    );
  }
}

/** `GET /careers` : débouchés portés par au moins une formation publiée. */
async function listPublic(req, res) {
  res.json(await careers.listPublic());
}

/** `GET /admin/careers` : tous les débouchés. */
async function listAll(req, res) {
  res.json(await careers.listAll());
}

/** `POST /admin/careers` : 201 avec le débouché créé. */
async function create(req, res) {
  const { name } = req.valid.body;
  await assertDomainExists(req.valid.body.domain_id);
  try {
    res.status(201).json(await careers.create(req.valid.body));
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `Un débouché nommé « ${name} » existe déjà.`,
      inUse: "Le domaine choisi n'existe plus.",
    });
  }
}

/** `PUT /admin/careers/:id` : 200. Renommer se répercute dans les formations. */
async function update(req, res) {
  const { name } = req.valid.body;
  await assertDomainExists(req.valid.body.domain_id);
  let career;
  try {
    career = await careers.update(req.valid.params.id, req.valid.body);
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `Un débouché nommé « ${name} » existe déjà.`,
      inUse: "Le domaine choisi n'existe plus.",
    });
  }
  if (!career) throw notFound();
  res.json(career);
}

/** `DELETE /admin/careers/:id` : 204, ou 409 tant qu'une formation le porte. */
async function remove(req, res) {
  const { id } = req.valid.params;
  const career = await careers.findById(id);
  if (!career) throw notFound();

  if (career.program_count > 0) {
    const n = career.program_count;
    throw httpError(
      409,
      "ELEMENT_UTILISE",
      `« ${career.name} » est porté par ${n} formation${n > 1 ? "s" : ""} : modifiez-les d'abord.`,
    );
  }
  try {
    await careers.remove(id);
  } catch (error) {
    // Filet de sécurité : rattachement créé entre le comptage et la suppression.
    throw translatePgError(error, {
      inUse: `« ${career.name} » est encore porté par une formation.`,
    });
  }
  res.status(204).end();
}

module.exports = { listPublic, listAll, create, update, remove };
