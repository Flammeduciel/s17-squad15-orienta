import { createContext, useContext } from 'react';

// L'objet de contexte et le hook sont ici, et le composant FavorisProvider dans FavorisContext.jsx :
// la règle ESLint react-refresh interdit de mélanger composant et hook dans un même .jsx.
export const FavorisContext = createContext(null);

/** Usage : const { ids, count, isFavori, toggle } = useFavoris(); */
export function useFavoris() {
  const ctx = useContext(FavorisContext);
  if (!ctx) throw new Error('useFavoris doit être utilisé dans <FavorisProvider>');
  return ctx;
}
