import { createContext, useContext } from 'react';

// L'objet de contexte et le hook sont ici, et le composant AuthProvider dans AuthContext.jsx :
// la règle ESLint react-refresh interdit de mélanger composant et hook dans un même .jsx.
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
