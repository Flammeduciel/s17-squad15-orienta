/* Compte - route /compte (ticket P10).
   Maquette : template/back-office.html. */
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../routes';
import { dateFr } from '../../utils/format';

const muted = { color: 'var(--muted)', fontSize: 14 };

function Compte() {
  const { user, logout } = useAuth();
  const { toggle } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    toast('Session fermée.');
    navigate(ROUTES.connexion, { replace: true });
  };

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Mon compte</h1>
          <p>Session en cours sur l'espace d'administration.</p>
        </div>
      </div>

      <div className="split">
        <div className="panel">
          <header>
            <h2>Identité</h2>
          </header>
          <div className="pad">
            <div className="kv">
              <div>
                <span>Nom</span>
                <b>{user.nom}</b>
              </div>
              <div>
                <span>Adresse e-mail</span>
                <b>{user.email}</b>
              </div>
              <div>
                <span>Rôle</span>
                <b>{user.role}</b>
              </div>
              <div>
                <span>Ouverture de session</span>
                <b>{dateFr(user.quand)}</b>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="panel">
            <header>
              <h2>Apparence</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 12 }}>
              <p style={muted}>
                Le thème sombre s'applique automatiquement à la nuit. Votre choix est mémorisé sur cet appareil.
              </p>
              <button className="btn line" type="button" onClick={toggle}>
                <Icon name="moon" />
                Basculer le thème
              </button>
            </div>
          </div>

          <div className="panel">
            <header>
              <h2>Session</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 12 }}>
              <button className="btn line" type="button" style={{ justifyContent: 'flex-start' }} onClick={onLogout}>
                <Icon name="logout" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Compte
