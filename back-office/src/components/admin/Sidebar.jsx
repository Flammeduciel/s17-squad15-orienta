import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../routes';
import Icon from '../Icon';
import Logo from '../Logo';
import { ACCOUNT_ITEM, NAV_GROUPS } from './navConfig';

export default function Sidebar({ open, user, onLogout, onNavigate }) {
  const name = user?.nom ?? user?.login ?? 'Squad';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <aside className={`side${open ? ' open' : ''}`} id="side">
      <Link className="brand" to={ROUTES.accueil} onClick={onNavigate}>
        <Logo />
        <span>
          <b>Orienta</b>
          <small>Espace Squad</small>
        </span>
      </Link>

      <nav aria-label="Navigation du back-office">
        {NAV_GROUPS.map((group) => (
          <div className="navgroup" key={group.title}>
            <h4>{group.title}</h4>
            {group.items.map((item) => (
              <NavLink key={item.to} className="navitem" to={item.to} end={item.end} onClick={onNavigate}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidefoot">
        <div className="who">
          <span className="avatar">{initials}</span>
          <span>
            <b>{name}</b>
            <small>{user?.role ?? ''}</small>
          </span>
        </div>
        <NavLink className="navitem" to={ACCOUNT_ITEM.to} onClick={onNavigate}>
          <Icon name={ACCOUNT_ITEM.icon} />
          <span>{ACCOUNT_ITEM.label}</span>
        </NavLink>
        <button className="navitem" type="button" onClick={onLogout}>
          <Icon name="logout" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
