import { USE_MOCK_API } from '../config'
import { request } from './http'
import * as mock from './mockCours'

/* Contrat attendu de l'API (BK6, Gilles ; formations : BK5, Flamme). À valider avec eux.

   GET    /cours        → [{ id, nom, liens: [{ formation, annee }] }]
   POST   /cours        { nom, liens }  → le cours créé        (409 si l'intitulé existe déjà)
   PUT    /cours/:id    { nom, liens }  → le cours modifié     (409 si l'intitulé existe déjà)
   DELETE /cours/:id
   GET    /formations   → [{ id, nom, institut, diplome, duree }]
                          (institut = sigle ; duree = nombre d'années du diplôme)

   `liens` est la liste COMPLÈTE des formations auxquelles le cours est rattaché : rattacher ou
   retirer un cours d'une formation revient à renvoyer la liste mise à jour. `annee` va de 1 à
   la durée de la formation. */
const real = {
  listCours: () => request('/cours'),
  listFormations: () => request('/formations'),
  createCours: (body) => request('/cours', { method: 'POST', body }),
  updateCours: (id, body) => request(`/cours/${id}`, { method: 'PUT', body }),
  deleteCours: (id) => request(`/cours/${id}`, { method: 'DELETE' }),
}

const api = USE_MOCK_API ? mock : real

// Accepte un tableau nu ou { data: [...] }.
const asList = (d) => (Array.isArray(d) ? d : (d?.data ?? []))

export const listCours = async () => asList(await api.listCours())
export const listFormations = async () => asList(await api.listFormations())
export const createCours = api.createCours
export const updateCours = api.updateCours
export const deleteCours = api.deleteCours
