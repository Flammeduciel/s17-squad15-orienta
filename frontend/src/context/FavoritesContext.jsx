import { useState } from 'react';
import { FavoritesContext } from './favorites-context';

const KEY = 'orienta-favs';

function stored() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Formations mises de côté par le visiteur. Elles sont gardées dans le
// navigateur : pas de compte, donc rien n'est envoyé au serveur.
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(stored);

  const isFavorite = (programId) => favorites.includes(programId);

  const toggleFavorite = (programId) => {
    const next = isFavorite(programId)
      ? favorites.filter((id) => id !== programId)
      : [...favorites, programId];
    setFavorites(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible : les favoris valent pour cette visite seulement */
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
