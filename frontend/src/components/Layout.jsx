import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

// Cadre commun : en-tête, page courante, pied de page.
export default function Layout() {
  const { pathname } = useLocation();

  // À chaque changement de page, on remonte en haut.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
