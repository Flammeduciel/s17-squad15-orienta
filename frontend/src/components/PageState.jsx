import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

// Ce qu'une page affiche tant que ses données ne sont pas là :
// un message de chargement, ou l'erreur avec un retour à l'accueil.
export default function PageState({ loading, error, notFound }) {
  if (loading) {
    return (
      <div className="wrap detail">
        <p style={{ color: 'var(--muted)' }}>Chargement…</p>
      </div>
    );
  }
  const missing = error?.status === 404;
  return (
    <div className="wrap detail">
      <div className="empty">
        <h3>{missing ? notFound : 'Une erreur est survenue'}</h3>
        <p>
          {missing
            ? "Cette page n'existe pas ou n'est plus publiée."
            : error?.status === 0
              ? error.message
              : 'Réessaie dans un instant.'}
        </p>
        <Link className="btn line" to={ROUTES.accueil}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
