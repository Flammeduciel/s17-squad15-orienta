import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

// Adresse inconnue, ou fiche qui n'existe plus : on le dit et on ramène à l'accueil.
export default function PageIntrouvable({
  title = 'Page introuvable',
  message = "Cette adresse n'existe pas ou n'existe plus.",
}) {
  return (
    <div className="wrap">
      <div className="about">
        <h1>{title}</h1>
        <p className="lead">{message}</p>
        <p>
          <Link className="btn" to={ROUTES.accueil}>
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
