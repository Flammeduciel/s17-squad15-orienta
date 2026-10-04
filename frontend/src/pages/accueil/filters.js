// Bornes du curseur « Budget par an » (FCFA). À MAX_BUDGET, il n'y a pas de limite.
export const MIN_BUDGET = 300000;
export const MAX_BUDGET = 800000;

// Filtres de l'accueil, tous vides. « view » dit ce que la grille affiche :
// 'inst' (instituts), 'form' (formations), 'dip' (diplômes) ou 'deb' (débouchés).
// districts, degrees et careers contiennent des identifiants.
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

// Critères envoyés à l'API (GET /institutes ou GET /programs) : c'est elle qui
// cherche et qui filtre. Un filtre vide n'est pas envoyé.
export function searchParams(filters) {
  const params = {};
  if (filters.q) params.q = filters.q;
  if (filters.domain) params.domain_id = filters.domain;
  if (filters.districts.length) params.district_id = filters.districts;
  // Les vues Diplômes et Débouchés montrent toutes les valeurs possibles :
  // le filtre de leur propre liste n'est donc pas envoyé.
  if (filters.degrees.length && filters.view !== 'dip') params.degree_id = filters.degrees;
  if (filters.careers.length && filters.view !== 'deb') params.career_id = filters.careers;
  if (filters.durations.length) params.duration = filters.durations;
  if (filters.budget < MAX_BUDGET) params.max_tuition = filters.budget;
  if (filters.series) params.bac_series = filters.series;
  if (filters.evening) params.evening = true;
  if (filters.internship) params.internship = true;
  if (filters.installments) params.installments = true;
  return params;
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

// Nom d'un arrondissement dans les listes. Tant qu'une seule ville est
// enregistrée, le nom suffit ; avec plusieurs, on précise la ville.
export function districtLabel(district, districts) {
  const severalCities = new Set(districts.map((item) => item.city)).size > 1;
  return severalCities ? `${district.name} (${district.city})` : district.name;
}
