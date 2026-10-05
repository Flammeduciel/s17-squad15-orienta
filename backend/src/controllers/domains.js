const httpError = require("../utils/httpError");
const { translatePgError } = require("../utils/pgErrors");
const domains = require("../models/domains");

const MAX_SLUG = 20;

/**
 * Transforme un nom en slug : sans accents, en minuscules, séparé par des
 * tirets, 20 caractères au plus (`Gestion & Finance` → `gestion-finance`).
 *
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/-+$/, "");
  return slug || "domaine";
}

/**
 * Premier slug libre : `sante`, puis `sante-2`, `sante-3`…
 *
 * @param {string} name
 * @returns {Promise<string>}
 */
async function freeSlug(name) {
  const base = slugify(name);
  let candidate = base;
  for (let n = 2; await domains.findById(candidate); n += 1) {
    const suffix = `-${n}`;
    candidate = base.slice(0, MAX_SLUG - suffix.length) + suffix;
  }
  return candidate;
}

/** @param {number} n @param {string} singular @param {string} plural */
const plural = (n, singular, plural_) => `${n} ${n > 1 ? plural_ : singular}`;

/** `GET /domains` : 200, tableau `[{ id, name, color }]`. */
async function list(req, res) {
  res.json(await domains.list());
}

/** `POST /admin/domains` : 201 avec le domaine créé. Le slug est généré ici. */
async function create(req, res) {
  const { name, color } = req.valid.body;
  try {
    const id = await freeSlug(name);
    res.status(201).json(await domains.create({ id, name, color }));
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `Un domaine nommé « ${name} » existe déjà.`,
    });
  }
}

/** `PUT /admin/domains/:id` : 200. Renommer ne touche ni formations ni débouchés. */
async function update(req, res) {
  const { name, color } = req.valid.body;
  let domain;
  try {
    domain = await domains.update(req.valid.params.id, { name, color });
  } catch (error) {
    throw translatePgError(error, {
      duplicate: `Un domaine nommé « ${name} » existe déjà.`,
    });
  }
  if (!domain) {
    throw httpError(
      404,
      "DOMAINE_INTROUVABLE",
      "Aucun domaine ne correspond à cet identifiant.",
    );
  }
  res.json(domain);
}

/** `DELETE /admin/domains/:id` : 204, ou 409 tant qu'une formation ou un débouché y est rattaché. */
async function remove(req, res) {
  const { id } = req.valid.params;
  const domain = await domains.findById(id);
  if (!domain) {
    throw httpError(
      404,
      "DOMAINE_INTROUVABLE",
      "Aucun domaine ne correspond à cet identifiant.",
    );
  }
  const usage = await domains.countUsage(id);
  if (usage.programs > 0 || usage.careers > 0) {
    const parts = [];
    if (usage.programs > 0)
      parts.push(plural(usage.programs, "formation", "formations"));
    if (usage.careers > 0)
      parts.push(plural(usage.careers, "débouché", "débouchés"));
    throw httpError(
      409,
      "ELEMENT_UTILISE",
      `« ${domain.name} » est utilisé par ${parts.join(" et ")} : modifiez-les d'abord.`,
    );
  }
  try {
    await domains.remove(id);
  } catch (error) {
    // Filet de sécurité : un rattachement créé entre le comptage et la suppression.
    throw translatePgError(error, {
      inUse: `« ${domain.name} » est encore utilisé : modifiez d'abord ses éléments.`,
    });
  }
  res.status(204).end();
}

module.exports = { list, create, update, remove };
