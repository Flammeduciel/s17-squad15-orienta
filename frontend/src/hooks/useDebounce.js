import { useEffect, useState } from 'react';

/**
 * Renvoie la valeur avec un petit retard : elle ne change qu'une fois que le
 * visiteur a arrêté de taper. Évite d'appeler l'API à chaque lettre.
 *
 *   const word = useDebounce(text, 300);
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
