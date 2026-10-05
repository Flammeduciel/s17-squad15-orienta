// Mise en forme des valeurs de l'API pour l'affichage (français, comme les maquettes).

// 650000 -> « 650 000 FCFA ». Les montants de l'API sont des entiers en FCFA.
export function formatFcfa(amount) {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

// « 2026-10-20 » -> « 20 oct. 2026 ». Une date absente ou illisible donne une chaîne vide.
export function formatDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso ?? '')) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// 1 -> « 1 an », 3 -> « 3 ans ».
export function formatDuration(years) {
  return `${years} an${years > 1 ? 's' : ''}`;
}

// (1, 'formation') -> « 1 formation », (3, 'formation') -> « 3 formations ».
export function plural(count, word) {
  return `${count} ${word}${count > 1 ? 's' : ''}`;
}
