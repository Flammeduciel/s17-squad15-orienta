import { Link } from 'react-router-dom';
import { useFavorites } from '../context/favorites-context';
import { useTheme } from '../hooks/useTheme';
import { ROUTES } from '../routes';
import Icon from './Icon';

// En-tête commun à toutes les pages.
export default function Header() {
  const { favorites } = useFavorites();
  const { toggle } = useTheme();

  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" to={ROUTES.accueil} aria-label="Orienta, accueil">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="currentColor" />
            <path d="M7 13.5 16 9l9 4.5-9 4.5-9-4.5Z" fill="#fff" />
            <path d="M11 16v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V16" stroke="#fff" strokeWidth="2" fill="none" />
            <path d="M24 14v5" stroke="#F0B415" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Orienta
        </Link>
        <div className="top-actions">
          <Link className="lnk hide-s" to={ROUTES.aPropos}>
            À propos
          </Link>
          <button className="lnk" type="button" title="Basculer le thème clair / sombre" onClick={toggle}>
            <Icon name="moon" />
          </button>
          <Link className="lnk" to={ROUTES.favoris}>
            <Icon name="heart" />
            <span>Favoris</span>
            {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
