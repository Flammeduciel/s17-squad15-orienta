import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

// Adresse inconnue : on le dit et on ramène à l'accueil.
export default function PageIntrouvable() {
  return (
    <div className="wrap">
      <div className="about">
        <h1>Page introuvable</h1>
        <p className="lead">Cette adresse n'existe pas ou n'existe plus.</p>
        <p>
          <Link className="btn" to={ROUTES.accueil}>
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
