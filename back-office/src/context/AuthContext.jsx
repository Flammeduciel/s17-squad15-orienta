import { useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Maintien de session : au chargement, on demande à l'API qui est connecté.
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
