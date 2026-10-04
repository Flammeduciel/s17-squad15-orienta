/**
 * Transforme un nom en identifiant court, sans accent ni espace.
 *
 * @param {string} text Nom lisible.
 * @param {number} max Longueur maximale.
 * @returns {string}
 *
 * @example
 * slugify('Arts & Design', 20); // 'arts-design'
 */
function slugify(text, max) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
}

module.exports = slugify;
