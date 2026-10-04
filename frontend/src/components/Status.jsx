import { errorMessage } from '../api/http';

// Affiche l'état d'un chargement : en cours, ou en erreur avec un bouton « Réessayer ».
// Sans chargement ni erreur, le composant n'affiche rien.
//
//   if (loading && !data) return <Status loading />;
//   if (error) return <Status error={error} onRetry={reload} />;
export default function Status({ loading = false, error = null, onRetry }) {
  if (loading) {
    return (
      <div className="empty" role="status">
        <p>Chargement…</p>
      </div>
    );
  }
  if (!error) return null;

  return (
    <div className="empty" role="alert">
      <h3>Une erreur est survenue</h3>
      <p>{errorMessage(error)}</p>
      {onRetry && (
        <button className="btn line" type="button" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
