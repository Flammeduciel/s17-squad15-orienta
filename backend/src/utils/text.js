/**
 * Met un texte en minuscules et sans accents, pour comparer sans tenir compte
 * de la casse ni des accents.
 *
 * @param {string} text
 * @returns {string}
 *
 * @example
 * normalize('Makélékélé'); // 'makelekele'
 */
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Dit si tous les mots de la recherche se trouvent dans le texte.
 *
 * @param {string} search Texte saisi par l'utilisateur.
 * @param {string} text Texte dans lequel chercher.
 * @returns {boolean}
 *
 * @example
 * matches('sante djoue', 'Institut de Santé du Djoué'); // true
 */
function matches(search, text) {
  const haystack = normalize(text);
  return normalize(search)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

module.exports = { normalize, matches };
