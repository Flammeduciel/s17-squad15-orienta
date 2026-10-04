import { request } from './http';

// Appels à l'API du site public. Le contrat est docs/openapi.yaml.
// Les listes renvoient { total, items } ; on ne garde que items.

export const getPrograms = () => request('/programs').then((data) => data.items);
export const getProgram = (id) => request(`/programs/${id}`);
export const getInstitutes = () => request('/institutes').then((data) => data.items);
export const getInstitute = (id) => request(`/institutes/${id}`);

// Listes de référence pour les filtres.
export const getDomains = () => request('/domains');
export const getDegrees = () => request('/degrees');
export const getBacSeries = () => request('/bac-series');
export const getCareers = () => request('/careers');
export const getDistricts = () => request('/districts');

// Question d'un bachelier à un institut (EX-06).
export const sendQuestion = (body) => request('/contact', { method: 'POST', body });
