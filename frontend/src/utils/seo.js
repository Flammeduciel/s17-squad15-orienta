// Référencement d'une page : met à jour le titre de l'onglet et les balises
// <meta> posées dans index.html (description, adresse canonique, aperçu de partage).
//
//   setSeo({ title: 'À propos · Orienta', description: '…', path: '/a-propos' });
//
// - title, description : ceux de la page.
// - path  : chemin de la page, pour son adresse canonique.
// - index : false pour une page qui ne doit pas apparaître dans les moteurs de recherche.

// Adresse publique du site (VITE_SITE_URL), sinon celle de la page ouverte.
const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

const ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

// Change un attribut d'une balise de l'en-tête, si elle existe.
function set(selector, attribute, value) {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute(attribute, value);
}

// Une description trop longue est coupée par les moteurs : on la limite à 160 caractères.
const shorten = (text) => (text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text);

export function setSeo({ title, description, path, index = true }) {
  const url = `${SITE_URL}${path}`;
  const text = shorten(description);

  document.title = title;
  set('meta[name="description"]', 'content', text);
  set('meta[name="robots"]', 'content', index ? ROBOTS : 'noindex, follow');
  set('link[rel="canonical"]', 'href', url);
  set('link[rel="alternate"][hreflang="fr"]', 'href', url);

  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', text);
  set('meta[name="twitter:title"]', 'content', title);
  set('meta[name="twitter:description"]', 'content', text);
}
