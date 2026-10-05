// Toutes les adresses du site public au même endroit.
// Pour changer une adresse, on ne modifie que ce fichier.
// Les adresses avec identifiant sont des fonctions : sans argument, elles donnent le modèle
// que le routeur attend (`/formations/:id`) ; avec un identifiant, le lien à afficher.
export const ROUTES = {
  accueil: '/',
  favoris: '/favoris',
  aPropos: '/a-propos',
  formation: (id = ':id') => `/formations/${id}`,
  debouche: (id = ':id') => `/debouches/${id}`,
  institut: (id = ':id') => `/instituts/${id}`,
};
