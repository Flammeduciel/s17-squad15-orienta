const httpError = require('../utils/httpError');
const { matches } = require('../utils/text');
const DISTRICTS = require('../utils/districts');
const institutes = require('../models/institutes');
const programService = require('../services/programs');

const NOT_FOUND = [404, 'INSTITUT_INTROUVABLE', 'Aucun institut ne correspond à cet identifiant.'];

/* Critères de `GET /institutes` qui portent sur les formations. */
const PROGRAM_FILTERS = [
  'domain_id',
  'degree_id',
  'career_id',
  'duration',
  'max_tuition',
  'bac_series',
  'evening',
  'internship',
  'installments',
];

/**
 * `GET /institutes` — liste des instituts.
 *
 * Sans critère de formation, tous les instituts sont renvoyés (filtrés par
 * arrondissement, agrément et recherche `q` sur leur nom). Avec un critère de
 * formation, seuls restent ceux qui proposent au moins une formation publiée
 * correspondante ; `program_count` et `degrees` ne comptent alors que celles-ci.
 */
async function listInstitutes(req, res) {
  const { q, district, accredited } = req.valid.query;
  const all = await institutes.findAll({ district, accredited });
  const byName = (institute) => matches(q || '', `${institute.name} ${institute.short_name} ${institute.district}`);

  const hasProgramFilter = PROGRAM_FILTERS.some((name) => Boolean(req.valid.query[name]));
  if (!hasProgramFilter && !q) {
    return res.json({ total: all.length, items: all });
  }

  // Formations publiées qui correspondent à tous les critères, recherche comprise.
  const programs = await programService.search({ ...req.valid.query, status: 'published' });
  const items = [];
  for (const institute of all) {
    const found = programs.filter((program) => program.institute.id === institute.id);
    if (found.length > 0) {
      items.push({
        ...institute,
        program_count: found.length,
        degrees: [...new Set(found.map((program) => program.degree.name))].sort(),
      });
    } else if (!hasProgramFilter && byName(institute)) {
      // Aucune formation ne correspond, mais le nom de l'institut, si.
      items.push(institute);
    }
  }
  return res.json({ total: items.length, items });
}

/** `GET /institutes/:id` — fiche d'un institut, avec ses formations publiées. */
async function getInstitute(req, res) {
  const institute = await institutes.findById(req.valid.params.id);
  if (!institute) throw httpError(...NOT_FOUND);
  res.json({ ...institute, programs: await publishedPrograms(institute.id) });
}

/** Formations publiées d'un institut, à la forme du contrat. */
function publishedPrograms(instituteId) {
  return programService.search({ institute_id: instituteId, status: 'published' });
}

/** `GET /districts` — les 9 arrondissements, avec leur nombre de formations publiées. */
async function listDistricts(req, res) {
  const counts = await institutes.countByDistrict();
  res.json(
    DISTRICTS.map((name) => {
      const found = counts.find((count) => count.name === name);
      return {
        name,
        institute_count: found ? found.institute_count : 0,
        program_count: found ? found.program_count : 0,
      };
    }),
  );
}

/** Refuse un nom ou un sigle déjà porté par un autre institut. */
async function checkUnique(body, currentId) {
  const other = await institutes.findByNameOrShortName(body.name, body.short_name);
  if (other && other.id !== currentId) {
    throw httpError(409, 'DEJA_EXISTANT', `Le nom ou le sigle est déjà utilisé par « ${other.name} » (${other.short_name}).`);
  }
}

/** `POST /admin/institutes` */
async function createInstitute(req, res) {
  await checkUnique(req.valid.body, null);
  const id = await institutes.create(req.valid.body);
  res.status(201).json({ ...(await institutes.findById(id)), programs: [] });
}

/** `PUT /admin/institutes/:id` */
async function updateInstitute(req, res) {
  const { id } = req.valid.params;
  await checkUnique(req.valid.body, id);
  const found = await institutes.update(id, req.valid.body);
  if (!found) throw httpError(...NOT_FOUND);
  res.json({ ...(await institutes.findById(id)), programs: await publishedPrograms(id) });
}

/** `DELETE /admin/institutes/:id` — supprime aussi les formations de l'institut. */
async function deleteInstitute(req, res) {
  const found = await institutes.remove(req.valid.params.id);
  if (!found) throw httpError(...NOT_FOUND);
  res.status(204).end();
}

module.exports = {
  listInstitutes,
  getInstitute,
  listDistricts,
  createInstitute,
  updateInstitute,
  deleteInstitute,
};
