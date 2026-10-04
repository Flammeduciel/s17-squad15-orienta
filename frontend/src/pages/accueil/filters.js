// Bornes du curseur « Budget par an » (FCFA). À MAX_BUDGET, il n'y a pas de limite.
export const MIN_BUDGET = 300000;
export const MAX_BUDGET = 800000;

// Filtres de l'accueil, tous vides. « view » dit ce que la grille affiche :
// 'inst' (instituts), 'form' (formations), 'dip' (diplômes) ou 'deb' (débouchés).
export const emptyFilters = () => ({
  q: '',
  domain: '',
  districts: [],
  careers: [],
  degrees: [],
  durations: [],
  budget: MAX_BUDGET,
  series: '',
  evening: false,
  internship: false,
  installments: false,
  sort: 'relevance',
  view: 'inst',
});

// Critères envoyés à l'API (GET /programs et GET /institutes) : le mot recherché
// et les filtres à une seule valeur. L'API n'accepte qu'une valeur par critère :
// les listes à choix multiples (arrondissements, débouchés, diplômes, durées)
// sont appliquées ensuite, dans le navigateur, par programMatches.
export function searchParams(filters) {
  const params = {};
  if (filters.q) params.q = filters.q;
  if (filters.domain) params.domain_id = filters.domain;
  if (filters.budget < MAX_BUDGET) params.max_tuition = filters.budget;
  if (filters.series) params.bac_series = filters.series;
  if (filters.evening) params.evening = true;
  if (filters.internship) params.internship = true;
  if (filters.installments) params.installments = true;
  return params;
}

// Vrai si la formation correspond aux filtres. Le mot recherché n'est pas vérifié
// ici : les formations reçues de l'API y correspondent déjà.
export function programMatches(program, filters) {
  const { institute } = program;
  if (filters.domain && program.domain.id !== filters.domain) return false;
  if (filters.careers.length && !filters.careers.some((career) => program.careers.includes(career))) return false;
  if (filters.degrees.length && !filters.degrees.includes(program.degree.name)) return false;
  if (filters.durations.length && !filters.durations.includes(program.duration)) return false;
  if (filters.budget < MAX_BUDGET && program.tuition > filters.budget) return false;
  if (filters.districts.length && !filters.districts.includes(institute.district)) return false;
  if (filters.series) {
    // Sans série rattachée, une formation est ouverte à toutes les séries, sauf un Master (post-licence).
    const open = program.bac_series.length
      ? program.bac_series.includes(filters.series)
      : program.degree.name !== 'Master';
    if (!open) return false;
  }
  if (filters.evening && !program.evening) return false;
  if (filters.internship && program.internship_months === 0) return false;
  if (filters.installments && !program.installments) return false;
  return true;
}

// Formations qui correspondent si on remplace un filtre par une seule valeur :
// sert aux compteurs du panneau et aux vues Diplômes et Débouchés.
export const programsWith = (programs, filters, key, value) =>
  programs.filter((program) => programMatches(program, { ...filters, [key]: [value] }));

// Vrai si un filtre porte sur les formations (et pas seulement sur l'institut).
const hasProgramFilter = (filters) =>
  Boolean(
    filters.domain ||
      filters.careers.length ||
      filters.degrees.length ||
      filters.durations.length ||
      filters.budget < MAX_BUDGET ||
      filters.series ||
      filters.evening ||
      filters.internship ||
      filters.installments,
  );

// Instituts à afficher, parmi ceux que l'API a trouvés : ceux qui ont au moins
// une formation correspondant aux filtres ; sans filtre de formation, tous
// (ils correspondent au mot recherché par leur nom).
export function instituteResults(institutes, programs, filters) {
  return institutes.filter((institute) => {
    if (programs.some((program) => program.institute.id === institute.id && programMatches(program, filters))) {
      return true;
    }
    if (hasProgramFilter(filters)) return false;
    return !filters.districts.length || filters.districts.includes(institute.district);
  });
}

// Nombre de filtres actifs, affiché sur le bouton « Filtres » en mobile.
export const activeCount = (filters) =>
  filters.careers.length +
  filters.degrees.length +
  filters.durations.length +
  filters.districts.length +
  (filters.budget < MAX_BUDGET ? 1 : 0) +
  (filters.series ? 1 : 0) +
  (filters.evening ? 1 : 0) +
  (filters.internship ? 1 : 0) +
  (filters.installments ? 1 : 0);

// Ajoute la valeur à la liste si elle n'y est pas, l'enlève sinon.
export const toggleIn = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
