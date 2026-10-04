import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import LoadError from './LoadError';

// Ce qu'une fiche affiche tant que ses données ne sont pas là : un indicateur
// de chargement, la page introuvable, ou l'erreur avec un bouton pour réessayer.
export default function PageState({ loading, error, notFound, onRetry }) {
  if (loading) {
    return (
      <div className="wrap detail">
        <div className="loading" role="status">
          Chargement…
        </div>
      </div>
    );
  }
  if (error?.status === 404) {
    return (
      <div className="wrap detail">
        <div className="empty">
          <h3>{notFound}</h3>
          <p>Cette page n'existe pas ou n'est plus publiée.</p>
          <Link className="btn line" to={ROUTES.accueil}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="wrap detail">
      <LoadError error={error} onRetry={onRetry} />
    </div>
  );
}
