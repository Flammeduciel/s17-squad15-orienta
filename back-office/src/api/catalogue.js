import { request, upload } from './http';

// Appels à l'API du catalogue. Le contrat est docs/openapi.yaml.
// Une fonction par route : une page ne fait jamais `fetch` elle-même.

const post = (path, body) => request(path, { method: 'POST', body });
const put = (path, body) => request(path, { method: 'PUT', body });
const del = (path) => request(path, { method: 'DELETE' });

// --- Tableau de bord
export const getIndicators = () => request('/admin/indicators');

// --- Domaines d'insertion
export const getDomains = () => request('/domains');
export const createDomain = (body) => post('/admin/domains', body);
export const updateDomain = (id, body) => put(`/admin/domains/${id}`, body);
export const deleteDomain = (id) => del(`/admin/domains/${id}`);

// --- Diplômes
export const getDegrees = () => request('/degrees');
export const createDegree = (body) => post('/admin/degrees', body);
export const updateDegree = (id, body) => put(`/admin/degrees/${id}`, body);
export const deleteDegree = (id) => del(`/admin/degrees/${id}`);

// --- Séries du bac
export const getBacSeries = () => request('/bac-series');
export const createBacSeries = (body) => post('/admin/bac-series', body);
export const updateBacSeries = (id, body) => put(`/admin/bac-series/${id}`, body);
export const deleteBacSeries = (id) => del(`/admin/bac-series/${id}`);

// --- Débouchés (tout le référentiel, même sans formation)
export const getCareers = () => request('/admin/careers');
export const createCareer = (body) => post('/admin/careers', body);
export const updateCareer = (id, body) => put(`/admin/careers/${id}`, body);
export const deleteCareer = (id) => del(`/admin/careers/${id}`);

// --- Instituts
export const getInstitutes = () => request('/institutes').then((data) => data.items);
export const getInstitute = (id) => request(`/institutes/${id}`);
export const createInstitute = (body) => post('/admin/institutes', body);
export const updateInstitute = (id, body) => put(`/admin/institutes/${id}`, body);
export const deleteInstitute = (id) => del(`/admin/institutes/${id}`);
// Dépose une image et renvoie son adresse : { url }.
export const uploadImage = (file) => upload('/admin/images', file);

// --- Formations (brouillons compris)
export const getPrograms = () => request('/admin/programs').then((data) => data.items);
export const getProgram = (id) => request(`/admin/programs/${id}`);
export const createProgram = (body) => post('/admin/programs', body);
export const updateProgram = (id, body) => put(`/admin/programs/${id}`, body);
export const deleteProgram = (id) => del(`/admin/programs/${id}`);

// --- Cours
export const getCourses = () => request('/admin/courses');
export const createCourse = (body) => post('/admin/courses', body);
export const updateCourse = (id, body) => put(`/admin/courses/${id}`, body);
export const deleteCourse = (id) => del(`/admin/courses/${id}`);
// Rattache un cours à une formation (ou change son année), ou l'en retire.
export const linkCourse = (programId, courseId, year) =>
  put(`/admin/programs/${programId}/courses/${courseId}`, { year });
export const unlinkCourse = (programId, courseId) => del(`/admin/programs/${programId}/courses/${courseId}`);
