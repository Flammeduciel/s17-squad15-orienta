import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

// Cadre commun des pages du site public : en-tête, contenu de la page, pied de page.
export default function Layout() {
  const { pathname } = useLocation();

  // Une nouvelle page s'ouvre en haut, comme avec un vrai changement d'adresse.
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
