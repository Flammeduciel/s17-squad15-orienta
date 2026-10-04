import { useState } from 'react';
import { emptyFilters } from '../pages/accueil/filters';
import { SearchContext } from './search-context';

// Filtres de l'accueil. Ils vivent au-dessus des pages : en revenant d'une
// fiche (« Retour aux résultats »), le visiteur retrouve sa recherche.
export function SearchProvider({ children }) {
  const [filters, setFilters] = useState(emptyFilters);

  // Modifie un ou plusieurs filtres : change({ view: 'form', careers: ['Infirmier'] }).
  const change = (patch) => setFilters((current) => ({ ...current, ...patch }));

  // Efface les filtres, en gardant la vue, le domaine et le tri choisis.
  const resetFilters = () =>
    setFilters((current) => ({
      ...emptyFilters(),
      view: current.view,
      domain: current.domain,
      sort: current.sort,
    }));

  return (
    <SearchContext.Provider value={{ filters, change, resetFilters }}>{children}</SearchContext.Provider>
  );
}
