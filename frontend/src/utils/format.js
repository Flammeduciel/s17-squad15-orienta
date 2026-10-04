import { API_URL } from '../api/http';

// Montant en francs CFA : 420000 -> « 420 000 FCFA ».
export const fcfa = (amount) => `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;

// Durée : 1 -> « 1 an », 3 -> « 3 ans ».
export const ans = (n) => `${n} an${n > 1 ? 's' : ''}`;

// Compte accordé : pluriel(2, 'institut') -> « 2 instituts ».
export const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

// Année d'études : 1 -> « 1re année », 2 -> « 2e année ».
export const niveau = (year) => `${year === 1 ? '1re' : `${year}e`} année`;

// Date de l'API (« 2026-11-03 ») -> « 3 nov. 2026 ».
export function dateFr(iso) {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

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

// Conditions d'admission d'une formation, en une phrase.
export function admission(program) {
  let series = 'Bac toutes séries';
  if (program.bac_series.length > 0) {
    series = `Bac série${program.bac_series.length > 1 ? 's' : ''} ${program.bac_series.join(', ')}`;
  } else if (program.degree.name === 'Master') {
    series = 'Licence dans le domaine';
  }
  return [series, program.admission_requirements].filter(Boolean).join(' · ');
}

// Adresse complète d'une image déposée : l'API renvoie « /uploads/… ».
export const imageUrl = (path) => (path ? API_URL + path : null);

// Liens de contact d'un institut.
export const whatsappLink = (institute, message) =>
  `https://wa.me/${institute.whatsapp}?text=${encodeURIComponent(message)}`;
export const mailLink = (institute, subject) =>
  `mailto:${institute.email}?subject=${encodeURIComponent(subject)}`;
