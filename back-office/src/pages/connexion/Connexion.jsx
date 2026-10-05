/* Connexion — route /connexion (ticket P1).
   Maquette : template/back-office.html. */
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import { PUBLIC_SITE_URL, USE_MOCK_AUTH } from '../../config';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ROUTES } from '../../routes';

function Connexion() {
  const { user, login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    document.title = 'Connexion — Orienta Brazzaville';
  }, []);

  // Déjà connecté (ou connexion réussie) : retour à la page demandée, sinon tableau de bord.
  const redirectTo = location.state?.from?.pathname ?? ROUTES.accueil;
  if (user) return <Navigate to={redirectTo} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.login.trim() || !form.password) {
      setError("Veuillez saisir votre nom d'utilisateur et votre mot de passe.");
      return;
    }
    setSubmitting(true);
    try {
      await login(form.login.trim(), form.password);
      toast("Bienvenue dans l'espace Squad.");
    } catch (err) {
      if (err.status === 401) {
        setError('Identifiants incorrects.');
        toast('Connexion refusée : identifiants incorrects.', true);
      } else if (err.status === 429) {
        setError('Trop de tentatives. Réessayez dans quelques minutes.');
      } else if (err.status === 0) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue. Réessayez.');
      }
      setForm((f) => ({ ...f, password: '' }));
      passwordRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form className="box" onSubmit={onSubmit} noValidate>
        <h1>Connexion</h1>
        <p>Identifiez-vous pour accéder au tableau de bord et au catalogue.</p>

        <div className="fld">
          <label htmlFor="u">Nom d'utilisateur</label>
          <input
            id="u"
            name="login"
            autoComplete="username"
            value={form.login}
            onChange={onChange}
          />
        </div>

        <div className="fld">
          <label htmlFor="p">Mot de passe</label>
          <input
            id="p"
            name="password"
            type="password"
            autoComplete="current-password"
            ref={passwordRef}
            value={form.password}
            onChange={onChange}
          />
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>

        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}

        <p style={{ fontSize: '13.5px' }}>
          <button className="linkbtn" type="button" onClick={() => setForgotOpen(true)}>
            Mot de passe oublié ?
          </button>
        </p>

        {USE_MOCK_AUTH && (
          <p className="hint" style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
            Démo : <b>squad</b> / <b>orienta2026</b>.
          </p>
        )}

        <p style={{ fontSize: '13.5px' }}>
          <a href={PUBLIC_SITE_URL} style={{ color: 'var(--green)', fontWeight: 700 }}>
            Retour au site public
          </a>
        </p>
      </form>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </AuthLayout>
  );
}

export default Connexion
