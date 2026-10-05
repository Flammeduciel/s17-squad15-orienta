// URL du site public (bouton « Voir le site » et « Retour au site public »).
export const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL ?? '/';

// true = faux backend d'authentification (voir src/api/mockAuth.js).
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// true = faux backend des cours (voir src/api/mockCours.js).
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
