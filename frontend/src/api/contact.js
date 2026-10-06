import { request } from './http';

// POST /contact (ticket P9, EX-06) : transmet la question d'un bachelier au
// secrétariat de l'institut (e-mail) et lui envoie un accusé de réception.
// L'API répond 202 avec { received: true } : la demande est mise en file d'envoi.
export async function envoyerQuestion({ program_id, name, email, message }) {
  const response = await request('/contact', {
    method: 'POST',
    body: { program_id, name, email, message },
  });

  if (response?.received !== true) {
    throw new Error("Réponse invalide : la demande n'a pas été confirmée.");
  }
  return response;
}