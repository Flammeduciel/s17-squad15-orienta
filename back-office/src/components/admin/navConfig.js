import { ROUTES } from '../../routes';

// Un seul endroit pour ajouter une entrée de menu : la sidebar et le fil d'Ariane en découlent.
// `end: true` = l'entrée n'est active que sur son adresse exacte (le tableau de bord, /admin,
// serait sinon actif sur toutes les pages /admin/...).
export const NAV_GROUPS = [
  {
    title: 'Pilotage',
    items: [{ to: ROUTES.accueil, label: 'Tableau de bord', icon: 'gauge', end: true }],
  },
  {
    title: 'Catalogue',
    inCrumbs: true, // « Espace Squad / Catalogue / Formations »
    items: [
      { to: ROUTES.instituts, label: 'Instituts', icon: 'building' },
      { to: ROUTES.formations, label: 'Formations', icon: 'cap' },
      { to: ROUTES.cours, label: 'Cours', icon: 'book' },
      { to: ROUTES.diplomes, label: 'Diplômes', icon: 'award' },
      { to: ROUTES.debouches, label: 'Débouchés', icon: 'brief' },
      { to: ROUTES.series, label: 'Séries du bac', icon: 'list' },
      { to: ROUTES.domaines, label: "Domaines d'insertion", icon: 'grid' },
      { to: ROUTES.villes, label: 'Villes', icon: 'city' },
      { to: ROUTES.arrondissements, label: 'Arrondissements', icon: 'pin' },
    ],
  },
];

export const ACCOUNT_ITEM = { to: ROUTES.compte, label: 'Mon compte', icon: 'user' };

const HOME = { t: 'Espace Squad', h: ROUTES.accueil };

const matches = (pathname, item) =>
  pathname === item.to || (!item.end && pathname.startsWith(`${item.to}/`));

/** Fil d'Ariane déduit de l'adresse. */
export function crumbsFor(pathname) {
  if (matches(pathname, ACCOUNT_ITEM)) return [HOME, { t: ACCOUNT_ITEM.label }];
  for (const group of NAV_GROUPS) {
    const item = group.items.find((it) => matches(pathname, it));
    if (item) {
      return group.inCrumbs ? [HOME, { t: group.title }, { t: item.label }] : [HOME, { t: item.label }];
    }
  }
  return [HOME];
}
