import { request } from './http'

export async function envoyerQuestion({ program_id, name, email, message }) {
  const response = await request('/contact', {
    method: 'POST',
    body: { program_id, name, email, message },
  })

  if (response?.received !== true) {
    throw new Error('Réponse invalide : la demande de contact n’a pas été confirmée.')
  }
  return response
}
