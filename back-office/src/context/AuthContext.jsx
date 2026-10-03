import { useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { SESSION_EXPIRED } from '../api/http';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Jeton refusé par l'API (expiré, compte supprimé) : on ferme la session,
  // et <ProtectedRoute> renvoie alors à la page de connexion.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, []);

  // Maintien de session : au chargement, on reprend la session gardée dans le navigateur.
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((data) => !cancelled && setUser(data.user ?? data))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (identifiant, password) => {
    const data = await authApi.login(identifiant, password);
    setUser(data.user ?? data);
  };

  // Fermeture de session : on vide l'état même si l'appel échoue.
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
