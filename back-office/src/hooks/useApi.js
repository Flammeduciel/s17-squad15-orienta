import { useEffect, useState } from 'react';

/**
 * Charge des données depuis l'API et suit l'état du chargement.
 *
 *   const { data, loading, error, reload } = useApi(() => getProgram(id), [id]);
 *
 * Après un ajout ou une modification, appeler reload() pour relire les données.
 *
 * - loader : fonction qui renvoie une promesse (un appel de src/api/).
 * - deps   : quand une de ces valeurs change, les données sont rechargées.
 */
export function useApi(loader, deps) {
  // « key » identifie la demande en cours : tant que le résultat gardé n'est pas
  // celui de cette demande, la page est en chargement.
  // « reloadCount » permet de recharger après un enregistrement : voir reload().
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

  // Pendant un rechargement, on garde les données déjà affichées : la page ne clignote pas.
  const loading = result.key !== key;
  return {
    data: result.data,
    loading,
    error: loading ? null : result.error,
    reload: () => setReloadCount((count) => count + 1),
  };
}
