import { useEffect, useState } from 'react';

/**
 * Charge des données depuis l'API et suit l'état du chargement.
 *
 *   const { data, loading, error, reload } = useApi(() => getProgram(id), [id]);
 *
 * - loader : fonction qui renvoie une promesse (un appel de src/api/).
 * - deps   : quand une de ces valeurs change, les données sont rechargées.
 * - reload : relance le chargement, par exemple depuis un bouton « Réessayer ».
 */
export function useApi(loader, deps) {
  // « key » identifie la demande en cours : tant que le résultat gardé n'est pas
  // celui de cette demande, la page est en chargement.
  const [reloadCount, setReloadCount] = useState(0);
  const key = JSON.stringify([...deps, reloadCount]);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setResult({ key, data, error: null }))
      .catch((error) => !cancelled && setResult({ key, data: null, error }));
    // Si la page change avant la réponse, on ignore cette réponse.
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = result.key !== key;
  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? null : result.error,
    reload: () => setReloadCount((count) => count + 1),
  };
}
