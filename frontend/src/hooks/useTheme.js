import { useState } from 'react';

const KEY = 'orienta-theme';

const systemDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches;

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** À appeler une fois avant le rendu : applique le thème choisi (sinon le thème système s'applique via le CSS). */
export function initTheme() {
  const t = stored();
  if (t) document.documentElement.dataset.theme = t;
}

/** Bascule clair/sombre. Le choix est mémorisé sur l'appareil. */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || (systemDark() ? 'dark' : 'light')
  );

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* stockage indisponible : le thème vaut pour cette session seulement */
    }
    setTheme(next);
  };

  return { theme, toggle };
}
