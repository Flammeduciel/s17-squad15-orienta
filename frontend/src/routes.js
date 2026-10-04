// Toutes les adresses du site public au même endroit.
export const ROUTES = {
  accueil: '/',
  favoris: '/favoris',
  formation: '/formations/:id',
  debouche: '/debouches/:id',
  institut: '/instituts/:id',
  aPropos: '/a-propos',
};

// Adresses d'une fiche précise.
export const formationPath = (id) => `/formations/${id}`;
export const institutPath = (id) => `/instituts/${id}`;
export const debouchePath = (id) => `/debouches/${id}`;
