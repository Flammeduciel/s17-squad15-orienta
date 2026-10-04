import { API_URL } from '../api/http';

// Montant en francs CFA : 420000 -> « 420 000 FCFA ».
export const fcfa = (amount) => `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;

// Durée : 1 -> « 1 an », 3 -> « 3 ans ».
export const ans = (n) => `${n} an${n > 1 ? 's' : ''}`;

// Compte accordé : pluriel(2, 'institut') -> « 2 instituts ».
export const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

// Année d'études : 1 -> « 1re année », 2 -> « 2e année ».
export const niveau = (year) => `${year === 1 ? '1re' : `${year}e`} année`;

// Date ISO -> « 03 oct. 2026 ».
export const dateFr = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// Texte sans accents ni majuscules, pour chercher sans tenir compte des accents.
export const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Vrai si tous les mots de la recherche sont dans le texte.
export const matches = (search, text) => {
  const haystack = normalize(text);
  return normalize(search)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

// Adresse complète d'une image déposée : l'API renvoie « /uploads/… ».
export const imageUrl = (path) => (path ? API_URL + path : null);

// Message à afficher pour une erreur de l'API.
export const errorMessage = (error) =>
  error?.status === 0 || error?.message ? error.message : 'Une erreur est survenue. Réessayez.';

// Les lignes de la page demandée d'une liste paginée. Si la page n'existe plus
// (liste raccourcie par un filtre), on retombe sur la dernière.
export function pageOf(rows, page, perPage) {
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, pages);
  return rows.slice((current - 1) * perPage, current * perPage);
}
