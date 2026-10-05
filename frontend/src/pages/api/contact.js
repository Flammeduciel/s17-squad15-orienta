import { request } from './http'

/* Contrat attendu (BK6, Gilles) :
   POST /contact { nom, email, question, institut, formation? }
     institut  = id de l'institut qui reçoit la question
     formation = id de la formation concernée (facultatif) : c'est ce qui associe la question à la formation
   → 201 { id }   (id = référence de la question, affichée dans l'accusé de réception)
   → 400 / 422 { message } si un champ est invalide */
export const envoyerQuestion = ({ nom, email, question, institut, formation }) =>
  request('/contact', {
    method: 'POST',
    body: { nom, email, question, institut, ...(formation ? { formation } : {}) },
  })