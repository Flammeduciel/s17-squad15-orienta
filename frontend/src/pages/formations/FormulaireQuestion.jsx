/* Question à un institut - formulaire affiché dans la fiche formation (ticket P9).
   Maquette : template/index.html. */
import { useState } from 'react';
import { sendQuestion } from '../../api/catalogue';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const EMPTY = { name: '', email: '', message: '' };

// Le bachelier pose sa question sans créer de compte : elle est transmise à
// l'institut, et il reçoit un accusé de réception (EX-06).
function FormulaireQuestion({ program, institute }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSent(false);
    if (!form.name.trim() || !form.message.trim()) {
      setError('Indique ton nom et ta question.');
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setError('Cette adresse e-mail est incomplète.');
      return;
    }
    setSubmitting(true);
    try {
      await sendQuestion({
        program_id: program.id,
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      if (err.status === 0) setError(err.message);
      else if (err.status === 400) setError(err.message);
      else setError('Ta question n\'a pas pu être envoyée. Réessaie dans un instant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form style={{ display: 'grid', gap: 12 }} onSubmit={onSubmit} noValidate>
      <div className="fld">
        <label htmlFor="a-nom">Ton nom</label>
        <input id="a-nom" name="name" placeholder="ex. Grâce Mabiala" value={form.name} onChange={onChange} />
      </div>
      <div className="fld">
        <label htmlFor="a-mail">Ton e-mail</label>
        <input
          id="a-mail"
          name="email"
          type="email"
          placeholder="ton.adresse@email.com"
          value={form.email}
          onChange={onChange}
        />
      </div>
      <div className="fld">
        <label htmlFor="a-msg">Ta question</label>
        <textarea
          id="a-msg"
          name="message"
          placeholder="ex. Reste-t-il des places ? Peut-on visiter l'institut ?"
          value={form.message}
          onChange={onChange}
        />
      </div>
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Envoi…' : `Envoyer ma question à ${institute.short_name}`}
      </button>
      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}
      {sent && (
        <div className="ok" role="status">
          Ta question a été transmise au secrétariat de {institute.short_name}. Un accusé de réception t'a été
          envoyé par e-mail.
        </div>
      )}
    </form>
  );
}

export default FormulaireQuestion
