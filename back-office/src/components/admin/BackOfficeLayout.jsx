import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ROUTES } from '../../routes';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { crumbsFor } from './navConfig';

export default function BackOfficeLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Espace Squad - Orienta Brazzaville';
  }, []);

  const onLogout = async () => {
    await logout();
    toast('Session fermée.');
    navigate(ROUTES.connexion, { replace: true });
  };

  return (
    <div className="shell">
      {/* Sur mobile, le menu se referme dès qu'on choisit une page. */}
      <Sidebar open={menuOpen} user={user} onLogout={onLogout} onNavigate={() => setMenuOpen(false)} />
      <div className="main">
        <Topbar crumbs={crumbsFor(pathname)} onMenu={() => setMenuOpen((v) => !v)} />
        <div className="page">
          <Outlet />
        </div>
        <div className="foot">Espace réservé à l'équipe de la Squad.</div>
      </div>
    </div>
  );
}
