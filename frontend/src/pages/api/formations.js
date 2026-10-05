import { request } from './http'

/* Contrat attendu (BK5, Flamme) :
   GET /formations/:id → { id, nom, institut, diplome, ... }   (404 si la formation n'existe plus)
   `institut` et `diplome` peuvent être du texte (« ISGF », « BTS ») ou un objet avec un `nom`. */
export const getFormation = (id) => request(`/formations/${encodeURIComponent(id)}`)