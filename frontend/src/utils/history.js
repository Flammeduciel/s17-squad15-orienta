// Formations consultées par le visiteur, gardées dans son navigateur.
// Elles alimentent « Consultées récemment » et « Les plus visitées » de l'accueil.
const RECENT = 'orienta-recent';
const VISITS = 'orienta-visits';

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on n'enregistre rien */
  }
}

// À appeler quand une fiche formation s'ouvre.
export function trackVisit(programId) {
  const visits = read(VISITS, {});
  visits[programId] = (visits[programId] || 0) + 1;
  write(VISITS, visits);
  const recent = [programId, ...read(RECENT, []).filter((id) => id !== programId)].slice(0, 8);
  write(RECENT, recent);
}

// Identifiants des dernières formations consultées, la plus récente d'abord.
export const recentIds = () => read(RECENT, []);

// Identifiants des formations les plus consultées, la plus vue d'abord.
export const popularIds = () =>
  Object.entries(read(VISITS, {}))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
