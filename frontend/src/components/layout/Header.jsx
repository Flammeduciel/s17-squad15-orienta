import { Link } from 'react-router-dom';
import { useFavoris } from '../../context/favoris-context';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../routes';
import Icon from '../Icon';
import Logo from '../Logo';

export default function Header() {
  const { toggle } = useTheme();
  const { count } = useFavoris();

  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" to={ROUTES.accueil} aria-label="Orienta, accueil">
          <Logo />
          Orienta
        </Link>

        <div className="top-actions">
          <Link className="lnk hide-s" to={ROUTES.aPropos}>
            À propos
          </Link>
          <button
            className="lnk"
            type="button"
            onClick={toggle}
            title="Basculer le thème clair / sombre"
            aria-label="Basculer le thème clair ou sombre"
          >
            <Icon name="moon" />
          </button>
          <Link className="lnk" to={ROUTES.favoris}>
            <Icon name="heart" />
            <span>Favoris</span>
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
