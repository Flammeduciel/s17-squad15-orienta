const httpError = require("../utils/httpError");
const institutes = require("../models/institutes");
const programService = require("../services/programs");

const notFound = () =>
  httpError(
    404,
    "INSTITUT_INTROUVABLE",
    "Aucun institut ne correspond à cet identifiant.",
  );

/** Critères de `GET /institutes` qui portent sur les formations. */
const PROGRAM_FILTERS = [
  "domain_id",
  "degree_id",
  "career_id",
  "duration",
  "max_tuition",
  "bac_series",
  "evening",
  "internship",
  "installments",
];

/** Ajoute à la fiche les formations publiées de l'institut. */
const withPrograms = async (institute) => ({
  ...institute,
  programs: await programService.search({
    institute_id: institute.id,
    status: "published",
  }),
});

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

/**
 * `GET /institutes` : 200, `{ total, items }`.
 *
 * Sans critère de formation ni recherche, tous les instituts (filtrés par
 * arrondissement et agrément). Avec un critère de formation, seuls restent
 * ceux qui proposent au moins une formation publiée correspondante ;
 * `program_count` et `degrees` ne comptent alors que celles-ci. La recherche
 * `q` trouve un institut par son nom, ou par une de ses formations.
 */
async function list(req, res) {
  const { q, district, accredited } = req.valid.query;
  const hasProgramFilter = PROGRAM_FILTERS.some((name) =>
    Boolean(req.valid.query[name]),
  );
  if (!hasProgramFilter && !q) {
    const items = await institutes.list({ district, accredited });
    return res.json({ total: items.length, items });
  }

  const all = await institutes.list({ district, accredited });
  // Instituts trouvés par leur nom : sans objet dès qu'un critère de formation est posé.
  const byName = hasProgramFilter
    ? []
    : await institutes.list({ q, district, accredited });
  // Formations publiées qui correspondent à tous les critères, recherche comprise.
  const programs = await programService.search({
    ...req.valid.query,
    status: "published",
  });

  const items = [];
  for (const institute of all) {
    const found = programs.filter(
      (program) => program.institute.id === institute.id,
    );
    if (found.length > 0) {
      items.push({
        ...institute,
        program_count: found.length,
        degrees: [...new Set(found.map((program) => program.degree.name))].sort(),
      });
    } else if (byName.some((item) => item.id === institute.id)) {
      items.push(institute);
    }
  }
  return res.json({ total: items.length, items });
}

/** `GET /institutes/:id` : 200 avec la fiche, ou 404. */
async function get(req, res) {
  const institute = await institutes.findById(req.valid.params.id);
  if (!institute) throw notFound();
  res.json(await withPrograms(institute));
}

/** `POST /admin/institutes` : 201 avec la fiche créée. */
async function create(req, res) {
  let id;
  try {
    id = await institutes.create(req.valid.body);
  } catch (error) {
    throw translateInstituteError(error, req.valid.body);
  }
  res.status(201).json(await withPrograms(await institutes.findById(id)));
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
  res.json(await withPrograms(await institutes.findById(id)));
}

/** `DELETE /admin/institutes/:id` : 204. Les formations de l'institut sont supprimées avec lui. */
async function remove(req, res) {
  if (!(await institutes.remove(req.valid.params.id))) throw notFound();
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };
