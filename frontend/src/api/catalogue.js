import { request } from './http';

// Appels à l'API du site public. Le contrat est docs/openapi.yaml.
// Les listes renvoient { total, items } ; on ne garde que items.

// Ajoute les critères de recherche à l'adresse : /programs?q=compta&evening=true
function withParams(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

// params : critères de recherche du contrat (q, domain_id, district, degree_id,
// career_id, duration, max_tuition, bac_series, evening, internship, installments,
// sort). Une liste devient « 1,3 » dans l'adresse. Sans critère, tout le catalogue publié.
export const getPrograms = (params) => request(withParams('/programs', params)).then((data) => data.items);
export const getProgram = (id) => request(`/programs/${id}`);
export const getInstitutes = (params) => request(withParams('/institutes', params)).then((data) => data.items);
export const getInstitute = (id) => request(`/institutes/${id}`);

// Listes de référence pour les filtres.
export const getDomains = () => request('/domains');
export const getDegrees = () => request('/degrees');
export const getBacSeries = () => request('/bac-series');
export const getCareers = () => request('/careers');
export const getDistricts = () => request('/districts');

// Question d'un bachelier à un institut (EX-06).
export const sendQuestion = (body) => request('/contact', { method: 'POST', body });
