// Petits outils partagés par les composants de la page Cours (P19).

// Recherche sans accents ni majuscules : « français » trouve « Francais ».
export const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// Année d'études à partir de son rang (0 = 1re année).
export const niveau = (k) => `${k ? `${k + 1}e` : '1re'} année`

// « Comptabilité et gestion des entreprises — ISGF »
export const libForme = (f) => (f ? `${f.nom} — ${f.institut}` : 'formation supprimée')

export const parNom = (a, b) => a.nom.localeCompare(b.nom, 'fr')

// « 1 formation », « 3 formations » ; mots invariables : pluriel(n, 'cours', 'cours') → « 165 cours ».
export const pluriel = (n, mot, formePlurielle = `${mot}s`) => `${n} ${n > 1 ? formePlurielle : mot}`