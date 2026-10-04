/**
 * Met les formations lues en base à la forme du contrat (`ProgramSummary`,
 * `ProgramDetail`) : c'est ici que les lignes SQL deviennent du JSON.
 *
 * @module services/programs
 */
const programs = require('../models/programs');
const institutes = require('../models/institutes');
const { matches } = require('../utils/text');

/**
 * @param {object} row Ligne de `models/programs`.
 * @param {{ fees: object[], series: object[], careers: object[] }} relations
 * @param {object} institute Résumé de l'institut de la formation.
 * @returns {object} `ProgramSummary` du contrat.
 */
function toSummary(row, relations, institute) {
  const mine = (list) => list.filter((item) => item.program_id === row.id);
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    degree: { id: row.degree_id, name: row.degree_name },
    duration: row.duration,
    tuition: row.tuition,
    fees: mine(relations.fees).map((fee) => ({ year: fee.year, amount: fee.amount })),
    bac_series: mine(relations.series).map((series) => series.code),
    admission_requirements: row.admission_requirements,
    evening: row.evening,
    internship_months: row.internship_months,
    installments: row.installments,
    careers: mine(relations.careers).map((career) => career.name),
    domain: { id: row.domain_id, name: row.domain_name, color: row.domain_color, icon: row.domain_icon },
    institute,
  };
}

/**
 * Recherche des formations et les renvoie à la forme du contrat.
 *
 * Les critères précis (domaine, diplôme, budget…) sont filtrés en SQL. La
 * recherche libre `q`, qui ignore la casse et les accents, est faite ici, sur
 * le nom, le diplôme, le domaine, les débouchés, les cours et l'institut.
 *
 * @param {object} filters Critères de `models/programs.findAll`, plus `q`.
 * @returns {Promise<object[]>}
 */
async function search(filters) {
  const rows = await programs.findAll(filters);
  const relations = await programs.findRelations(rows.map((row) => row.id));
  const allInstitutes = await institutes.findAll({});
  let list = rows.map((row) =>
    toSummary(row, relations, allInstitutes.find((institute) => institute.id === row.institute_id)),
  );
  if (filters.q) {
    list = list.filter((program) => {
      const courses = relations.courses.filter((course) => course.program_id === program.id);
      return matches(
        filters.q,
        [
          program.name,
          program.degree.name,
          program.domain.name,
          program.careers.join(' '),
          courses.map((course) => course.name).join(' '),
          program.institute.name,
          program.institute.short_name,
        ].join(' '),
      );
    });
  }
  return list;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>} `ProgramDetail` du contrat, ou `null`.
 */
async function getDetail(id) {
  const row = await programs.findById(id);
  if (!row) return null;
  const relations = await programs.findRelations([id]);
  const allInstitutes = await institutes.findAll({});
  const institute = allInstitutes.find((item) => item.id === row.institute_id);
  return {
    ...toSummary(row, relations, institute),
    description: row.description,
    courses: relations.courses.map((course) => course.name),
    years: toYears(relations.courses, row.duration, row.degree_name),
  };
}

/**
 * Regroupe les cours d'une formation par année. Une année sans cours est omise.
 *
 * @param {{ year: number, name: string }[]} courses Cours déjà triés par année et position.
 * @param {number} duration Durée du diplôme.
 * @param {string} degreeName Un Master est libellé « M1 », « M2 » ; les autres « 1re année », « 2e année »…
 * @returns {{ year: number, label: string, courses: string[] }[]}
 */
function toYears(courses, duration, degreeName) {
  const years = [];
  for (let year = 1; year <= duration; year += 1) {
    const names = courses.filter((course) => course.year === year).map((course) => course.name);
    if (names.length > 0) {
      const label = degreeName === 'Master' ? `M${year}` : `${year === 1 ? '1re' : `${year}e`} année`;
      years.push({ year, label, courses: names });
    }
  }
  return years;
}

module.exports = { search, getDetail };
