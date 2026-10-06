import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import Icon from './Icon';

// « Retour aux résultats » : revient à la page précédente quand il y en a une, pour retrouver la recherche
// telle qu'elle était (les filtres sont dans l'adresse), sinon ouvre l'accueil.
export default function BackLink({ children = 'Retour aux résultats' }) {
  const navigate = useNavigate();
  const canGoBack = window.history.state?.idx > 0;

  function back(event) {
    if (!canGoBack) return;
    event.preventDefault();
    navigate(-1);
  }

  return (
    <Link className="back" to={ROUTES.accueil} onClick={back}>
      <Icon name="back" />
      {children}
    </Link>
  );
}
