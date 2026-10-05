import { useEffect, useMemo, useState } from 'react';
import { FavorisContext } from './favoris-context';

// Même clé que la maquette. Pas de compte côté étudiant : les favoris restent dans
// le navigateur, sous forme d'identifiants de formations (le contenu vient de l'API).
const KEY = 'orienta-favs';

function readIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY));
    // Les identifiants de l'API sont des entiers : on écarte tout le reste.
    return Array.isArray(ids) ? ids.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

export function FavorisProvider({ children }) {
  const [ids, setIds] = useState(readIds);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* stockage indisponible : les favoris valent pour cette visite seulement */
    }
  }, [ids]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      isFavori: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id])),
    }),
    [ids],
  );

  return <FavorisContext.Provider value={value}>{children}</FavorisContext.Provider>;
}
