import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';
import Icon from '../Icon';
import Logo from '../Logo';

// Écran scindé de la maquette : panneau vert à gauche, formulaire à droite.
export default function AuthLayout({ children }) {
  return (
    <div className="login">
      <div className="art">
        <Link className="brand" to={ROUTES.connexion} style={{ border: 0, padding: 0, color: '#fff' }}>
          <Logo inverse />
          <span>
            <b style={{ color: '#fff' }}>Orienta</b>
            <small style={{ color: '#B9DAC9' }}>Espace Squad</small>
          </span>
        </Link>

        <div>
          <h2>Le catalogue de Brazzaville, tenu à jour.</h2>
          <p>
            Instituts, formations, diplômes et débouchés : une seule source de vérité pour les
            bacheliers de la capitale.
          </p>
          <div className="pts">
            <div>
              <Icon name="check" />
              <span>Instituts, formations et référentiels gérés au même endroit</span>
            </div>
            <div>
              <Icon name="check" />
              <span>Agréments affichés avec leur numéro officiel</span>
            </div>
            <div>
              <Icon name="check" />
              <span>Les modifications se retrouvent sur le site public</span>
            </div>
          </div>
        </div>

        <div className="loginfoot">
          Usage réservé à l'équipe de la Squad. Les comptes sont ouverts par un SuperAdmin.
        </div>
      </div>

      <div className="formside">{children}</div>
    </div>
  );
}
