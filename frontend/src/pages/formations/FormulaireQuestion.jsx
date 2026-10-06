import { useState } from 'react';
import { envoyerQuestion } from '../../api/contact';

/* Question à un institut (ticket P9, EX-06) : nom, e-mail et question envoyés à
   POST /contact. Le formulaire porte la formation depuis laquelle il est ouvert.
   S'intègre à la fiche formation (P4). Maquette : template/index.html. */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function FormulaireQuestion({ institut, formation, envoyer = envoyerQuestion }) {
  const [form, setForm] = useState({ nom: '', email: '', question: '' });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [accuse, setAccuse] = useState('');

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  function numeroFormation() {
    const programId = Number(formation?.id);
    return Number.isInteger(programId) && programId > 0;
  }

  function valider() {
    const erreursFormulaire = {};
    if (!numeroFormation()) {
      erreursFormulaire.formation = 'Cette formation ne peut pas recevoir de question pour le moment.';
    }
    if (!form.nom.trim()) erreursFormulaire.nom = 'Indiquez votre nom.';
    if (!EMAIL_RE.test(form.email.trim())) erreursFormulaire.email = 'Cette adresse e-mail est incomplète.';
    if (form.question.trim().length < 10) {
      erreursFormulaire.question = 'Votre question est trop courte (10 caractères minimum).';
    }
    return erreursFormulaire;
  }

  async function soumettre(event) {
    event.preventDefault();
    if (envoi) return;
    setErreurServeur('');
    const erreursFormulaire = valider();
    setErreurs(erreursFormulaire);
    if (Object.keys(erreursFormulaire).length > 0) return;

    setEnvoi(true);
    try {
      await envoyer({
        program_id: Number(formation.id),
        name: form.nom.trim(),
        email: form.email.trim(),
        message: form.question.trim(),
      });
      setAccuse(form.email.trim());
      setForm({ nom: '', email: '', question: '' });
    } catch (ex) {
      if (ex.status === 429) setErreurServeur('Trop de demandes. Réessayez dans quelques minutes.');
      else setErreurServeur(ex.message || "Votre question n'a pas pu être envoyée. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  if (accuse) {
    return (
      <div className="ok" role="status">
        <b>Question envoyée.</b>
        <p>
          L'institut a bien reçu votre question{formation ? ` à propos de « ${formation.name} »` : ''}. Il
          vous répondra à {accuse}.
        </p>
        <button type="button" className="btn line sm" onClick={() => setAccuse('')}>
          Poser une autre question
        </button>
      </div>
    );
  }

  const champ = (nom, label, props = {}) => (
    <div className={`fld${erreurs[nom] ? ' bad' : ''}`}>
      <label htmlFor={`q-${nom}`}>{label}</label>
      {props.multiline ? (
        <textarea
          id={`q-${nom}`}
          name={nom}
          rows={5}
          value={form[nom]}
          onChange={change}
          aria-invalid={Boolean(erreurs[nom])}
          aria-describedby={erreurs[nom] ? `q-${nom}-err` : undefined}
        />
      ) : (
        <input
          id={`q-${nom}`}
          name={nom}
          type={props.type ?? 'text'}
          autoComplete={props.autoComplete}
          value={form[nom]}
          onChange={change}
          aria-invalid={Boolean(erreurs[nom])}
          aria-describedby={erreurs[nom] ? `q-${nom}-err` : undefined}
        />
      )}
      {erreurs[nom] && (
        <span className="err" id={`q-${nom}-err`} role="alert">
          {erreurs[nom]}
        </span>
      )}
    </div>
  );

  return (
    <form className="form" onSubmit={soumettre} noValidate>
      <h2>Poser une question à {institut?.name ?? "l'institut"}</h2>
      {formation && <p>À propos de la formation « {formation.name} ».</p>}

      {erreurs.formation && (
        <div className="err" role="alert">
          {erreurs.formation}
        </div>
      )}

      {champ('nom', 'Votre nom', { autoComplete: 'name' })}
      {champ('email', 'Votre e-mail', { type: 'email', autoComplete: 'email' })}
      {champ('question', 'Votre question', { multiline: true })}

      {erreurServeur && (
        <div className="err" role="alert">
          {erreurServeur}
        </div>
      )}

      <button type="submit" className="btn" disabled={envoi}>
        {envoi ? 'Envoi…' : `Envoyer ma question à ${institut?.short_name ?? "l'institut"}`}
      </button>
    </form>
  );
}