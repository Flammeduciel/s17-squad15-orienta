import { formatDuration, formatFcfa } from '../../utils/format';

// Les filtres de l'accueil vivent dans l'adresse de la page (?district=Bacongo&evening=true) :
// ils survivent à un retour depuis une fiche et la recherche se partage par lien.
// Les noms sont ceux des paramètres de l'API, ils lui sont transmis tels quels.
export const FILTER_KEYS = [
  'q',
  'domain_id',
  'district',
  'degree_id',
  'career_id',
  'duration',
  'max_tuition',
  'bac_series',
  'evening',
  'internship',
  'installments',
];

// Bornes du curseur de budget : à droite, « Sans limite » (aucun filtre).
export const MIN_BUDGET = 300000;
export const MAX_BUDGET = 800000;

export const VUES = ['inst', 'form', 'dip', 'deb'];

export const SORTS = [
  { value: 'relevance', label: 'Trier : pertinence' },
  { value: 'tuition_asc', label: 'Prix croissant' },
  { value: 'tuition_desc', label: 'Prix décroissant' },
  { value: 'duration', label: 'Durée la plus courte' },
];

// Filtres actifs sous forme d'objet : seules les clés renseignées sont gardées.
export function readFilters(params) {
  const filters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

export function readVue(params) {
  const vue = params.get('vue');
  return VUES.includes(vue) ? vue : 'inst';
}

// Pastilles sous la barre de résultats, une par filtre actif (le domaine a sa propre barre).
export function activeTags(filters, { degrees, careers, series }) {
  const tags = [];
  const add = (key, label) => tags.push({ key, label });

  if (filters.q) add('q', `« ${filters.q} »`);
  if (filters.district) add('district', filters.district);
  if (filters.career_id) add('career_id', careers.find((c) => String(c.id) === filters.career_id)?.name ?? 'Débouché');
  if (filters.degree_id) add('degree_id', degrees.find((d) => String(d.id) === filters.degree_id)?.name ?? 'Diplôme');
  if (filters.duration) add('duration', formatDuration(Number(filters.duration)));
  if (filters.max_tuition) add('max_tuition', `≤ ${formatFcfa(Number(filters.max_tuition))}`);
  if (filters.bac_series) {
    add('bac_series', `Série ${series.find((s) => s.code === filters.bac_series)?.code ?? filters.bac_series}`);
  }
  if (filters.evening) add('evening', 'Cours du soir');
  if (filters.internship) add('internship', 'Stage inclus');
  if (filters.installments) add('installments', 'Paiement en tranches');
  return tags;
}

// Vue « Diplômes » : les formations trouvées regroupées par diplôme (seuls ceux qui en ont).
export function groupByDegree(programs) {
  const groups = new Map();
  for (const program of programs) {
    const { id, name } = program.degree;
    if (!groups.has(id)) groups.set(id, { id, name, duration: program.duration, programs: [] });
    groups.get(id).programs.push(program);
  }
  return [...groups.values()].sort((a, b) => a.duration - b.duration || a.name.localeCompare(b.name, 'fr'));
}

// Vue « Débouchés » : les formations trouvées regroupées par débouché. L'identifiant vient de /careers
// (une formation ne porte que les noms) ; un débouché inconnu de cette liste est écarté.
export function groupByCareer(programs, careers) {
  const idByName = new Map(careers.map((c) => [c.name, c.id]));
  const groups = new Map();
  for (const program of programs) {
    for (const name of program.careers) {
      if (!idByName.has(name)) continue;
      if (!groups.has(name)) groups.set(name, { id: idByName.get(name), name, programs: [] });
      groups.get(name).programs.push(program);
    }
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

// Nombre d'instituts différents dans un groupe de formations.
export function countInstitutes(programs) {
  return new Set(programs.map((p) => p.institute.id)).size;
}
