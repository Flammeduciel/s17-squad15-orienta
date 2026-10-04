import { useEffect, useState } from 'react';
import { forgotPassword } from '../../api/auth';
import { useToast } from '../../context/toast-context';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ForgotPasswordModal({ onClose }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Échap ferme la fenêtre.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError('Cette adresse e-mail est incomplète.');
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(value);
      onClose();
      // Même message que le compte existe ou non : on n'expose pas la liste des comptes.
      toast("Si ce compte existe, un lien de réinitialisation vient d'être envoyé.");
    } catch (err) {
      setError(err.status === 0 ? err.message : 'Une erreur est survenue. Réessayez.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="mbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fg-title"
        onSubmit={onSubmit}
        noValidate
      >
        <h3 id="fg-title">Mot de passe oublié</h3>
        <p>
          Saisissez l'adresse e-mail liée à votre compte : un lien de réinitialisation vous sera
          envoyé.
        </p>

        <div className={`fld${error ? ' bad' : ''}`}>
          <label htmlFor="fg-m">Adresse e-mail</label>
          <input
            id="fg-m"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
          />
          {error && (
            <span className="err" role="alert">
              {error}
            </span>
          )}
        </div>

        <div className="mact">
          <button className="btn line" type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </div>
      </form>
    </div>
  );
}
