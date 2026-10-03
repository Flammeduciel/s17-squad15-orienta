import { Link } from 'react-router-dom';
import { PUBLIC_SITE_URL } from '../../config';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../Icon';

export default function Topbar({ crumbs, onMenu }) {
  const { toggle } = useTheme();

  return (
    <div className="bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="iconbtn burger" type="button" aria-label="Ouvrir le menu" onClick={onMenu}>
          <Icon name="menu" />
        </button>
        <nav className="crumbs" aria-label="Fil d'Ariane">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={`${c.t}-${i}`} style={{ display: 'contents' }}>
                {i > 0 && <span className="sep">/</span>}
                {c.h && !last ? <Link to={c.h}>{c.t}</Link> : <b>{c.t}</b>}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="baractions">
        <button className="iconbtn" type="button" onClick={toggle} aria-label="Basculer le thème clair ou sombre">
          <Icon name="moon" />
        </button>
        <a className="iconbtn" href={PUBLIC_SITE_URL}>
          <Icon name="eye" />
          <span>Voir le site</span>
        </a>
      </div>
    </div>
  );
}
