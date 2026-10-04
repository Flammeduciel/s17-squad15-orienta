/* Compte — route /compte (ticket P10).
   Maquette : template/back-office.html. */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useTheme } from '../../context/theme-context'
import { useToast } from '../../context/toast-context'
import { ROUTES } from '../../routes'
import Icon from '../../components/Icon'
import { formatDate } from '../../utils/date'

   // juste si l'api n'est pas encore prete
function formatDate(iso) {
  const d = iso ? new Date(iso) : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Compte() {
  const { user, logout } = useAuth()
  const { toggle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Mon compte — Espace Squad'
  }, [])

  // Fermeture de session : l'état est vidé même si l'API échoue, puis retour à la connexion.
  const onLogout = async () => {
    await logout()
    toast('Session fermée.')
    navigate(ROUTES.connexion, { replace: true })
  }

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
                <b>{user?.nom ?? '—'}</b>
              </div>
              <div>
                <span>Identifiant</span>
                <b>{user?.login ?? '—'}</b>
              </div>
              <div>
                <span>Rôle</span>
                <b>{user?.role ?? '—'}</b>
              </div>
              <div>
                <span>Ouverture de session</span>
                <b>{formatDate(user?.quand)}</b>
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
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Le thème sombre s'applique automatiquement à la nuit. Votre choix est mémorisé sur cet
                appareil.
              </p>
              <button className="btn line" type="button" onClick={toggle}>
                <Icon name="moon" />
                Basculer le thème
              </button>
            </div>
          </div>

          <div className="panel">
            <header>
              <h2>Mot de passe</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 12 }}>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Pour changer de mot de passe, déconnectez-vous puis utilisez « Mot de passe oublié » sur
                l'écran de connexion : un lien de réinitialisation est envoyé par e-mail.
              </p>
            </div>
          </div>

          <div className="panel">
            <header>
              <h2>Session</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 12 }}>
              <button
                className="btn line"
                type="button"
                onClick={onLogout}
                style={{ justifyContent: 'flex-start' }}
              >
                <Icon name="logout" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Compte
