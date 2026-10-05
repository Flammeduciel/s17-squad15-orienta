/* Nouveau mot de passe — route /reinitialiser-mot-de-passe?token=… (ticket P1).
   Page ouverte depuis le lien reçu par e-mail. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import AuthLayout from '../../components/auth/AuthLayout';
import { useToast } from '../../context/toast-context';
import { ROUTES } from '../../routes';

const linkStyle = { color: 'var(--green)', fontWeight: 700 };

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Nouveau mot de passe — Orienta Brazzaville';
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, form.password);
      toast('Mot de passe modifié. Vous pouvez vous connecter.');
      navigate(ROUTES.connexion, { replace: true });
    } catch (err) {
      if (err.code === 'PARAMETRE_INVALIDE') {
        // Mot de passe refusé par l'API : son message dit pourquoi.
        setError(err.message);
      } else if ([400, 401, 410].includes(err.status)) {
        setError('Ce lien est invalide ou expiré. Refaites une demande depuis la page de connexion.');
      } else if (err.status === 0) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue. Réessayez.');
      }
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="box">
          <h1>Lien invalide</h1>
          <p>Le lien de réinitialisation est incomplet ou a expiré.</p>
          <p style={{ fontSize: '13.5px' }}>
            <Link to={ROUTES.connexion} style={linkStyle}>
              Retour à la connexion
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="box" onSubmit={onSubmit} noValidate>
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un mot de passe d'au moins 8 caractères.</p>

        <div className="fld">
          <label htmlFor="np">Nouveau mot de passe</label>
          <input
            id="np"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={onChange}
          />
        </div>

        <div className="fld">
          <label htmlFor="cp">Confirmation</label>
          <input
            id="cp"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={onChange}
          />
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>

        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}

        <p style={{ fontSize: '13.5px' }}>
          <Link to={ROUTES.connexion} style={linkStyle}>
            Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword
