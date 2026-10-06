import { createContext, useContext } from 'react';

// L'objet de contexte et le hook sont ici, et le composant FavoritesProvider dans
// FavoritesContext.jsx : la règle ESLint react-refresh interdit de mélanger
// composant et hook dans un même .jsx.
export const FavoritesContext = createContext(null);

// const { favorites, isFavorite, toggleFavorite } = useFavorites();
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites doit être utilisé dans <FavoritesProvider>');
  return ctx;
}
