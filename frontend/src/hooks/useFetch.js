import { useEffect, useState } from 'react';
import { request } from '../api/http';

/**
 * Lit une ressource de l'API (GET) et suit l'état de l'appel.
 *
 *   const { data, loading, error, reload } = useFetch('/institutes', { district, q });
 *
 * L'appel est refait quand le chemin ou les paramètres changent (ils sont comparés
 * par valeur : inutile de les mémoriser). Sans chemin (`null`), rien n'est appelé,
 * ce qui sert aux formulaires qui n'ont rien à charger en création.
 * Pendant un nouveau chargement, `data` garde le dernier résultat reçu : la liste
 * ne disparaît pas à chaque changement de filtre.
 */
export function useFetch(path, params) {
  const key = path ? JSON.stringify([path, params ?? null]) : null;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, attempt: -1, data: null, error: null });

  useEffect(() => {
    if (key === null) return;
    const [url, query] = JSON.parse(key);
    let cancelled = false;
    request(url, { params: query })
      .then((data) => !cancelled && setResult({ key, attempt, data, error: null }))
      .catch((error) => !cancelled && setResult((last) => ({ key, attempt, data: last.data, error })));
    // Une réponse qui arrive après un changement de page ou de filtre est ignorée.
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const settled = key !== null && result.key === key && result.attempt === attempt;
  return {
    data: key === null ? null : result.data,
    error: settled ? result.error : null,
    loading: key !== null && !settled,
    reload: () => setAttempt((n) => n + 1),
  };
}
