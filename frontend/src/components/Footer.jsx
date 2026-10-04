import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

// Pied de page commun à toutes les pages.
export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026 Orienta · Les instituts privés de Brazzaville, au même endroit</span>
        <span>
          <Link to={ROUTES.aPropos}>À propos</Link>
        </span>
      </div>
    </footer>
  );
}
