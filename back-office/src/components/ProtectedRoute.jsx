import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { ROUTES } from '../routes';

// Entoure toutes les pages qui exigent une session ouverte.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p style={{ padding: 24, color: 'var(--muted)' }}>Chargement…</p>;
  if (!user) return <Navigate to={ROUTES.connexion} state={{ from: location }} replace />;
  return <Outlet />;
}
