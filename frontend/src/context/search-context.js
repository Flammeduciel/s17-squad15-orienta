import { createContext, useContext } from 'react';

export const SearchContext = createContext(null);

// const { filters, setFilters, resetFilters } = useSearch();
export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch doit être utilisé dans <SearchProvider>');
  return ctx;
}
