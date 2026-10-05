import { useState } from 'react'
import { envoyerQuestion } from '../api/contact'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/* P9, Question à un institut : formulaire nom / e-mail / question, envoyé à POST /contact.
   <QuestionInstitut institut={{ id, nom }} formation={{ id, nom }} />
   - institut : obligatoire, destinataire de la question
   - formation : facultatif, associe la question à la formation consultée
   `envoyer` est remplaçable (tests, client HTTP de S5). */
export default function QuestionInstitut({ institut, formation, envoyer = envoyerQuestion }) {
  const [form, setForm] = useState({ nom: '', email: '', question: '' })
  const [erreurs, setErreurs] = useState({})
  const [erreurServeur, setErreurServeur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [accuse, setAccuse] = useState(null) // { reference, email }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const valider = () => {
    const e = {}
    if (!form.nom.trim()) e.nom = 'Indiquez votre nom.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Cette adresse e-mail est incomplète.'
    if (form.question.trim().length < 10) e.question = 'Votre question est trop courte (10 caractères minimum).'
    return e
  }

  const soumettre = async (ev) => {
    ev.preventDefault()
    if (envoi) return
    setErreurServeur('')
    const e = valider()
    setErreurs(e)
    if (Object.keys(e).length) return

    setEnvoi(true)
    try {
      const reponse = await envoyer({
        nom: form.nom.trim(),
        email: form.email.trim(),
        question: form.question.trim(),
        institut: institut.id,
        formation: formation?.id,
      })
      setAccuse({ reference: reponse?.id ?? null, email: form.email.trim() })
      setForm({ nom: '', email: '', question: '' })
    } catch (ex) {
      if (ex.status === 429) setErreurServeur('Trop de demandes. Réessayez dans quelques minutes.')
      else if (ex.status === 0) setErreurServeur(ex.message)
      else if (ex.status === 400 || ex.status === 422) setErreurServeur(ex.message || 'Certains champs sont invalides.')
      else setErreurServeur("Votre question n'a pas pu être envoyée. Réessayez.")
    } finally {
      setEnvoi(false)
    }
  }

  // Accusé de réception
  if (accuse) {
    return (
      <div className="ok" role="status">
        <b>Question envoyée.</b>
        <p>
          {institut.nom} a bien reçu votre question{formation ? ` à propos de « ${formation.nom} »` : ''}.
          {accuse.reference != null && <> Référence : <b>#{accuse.reference}</b>.</>} L'institut vous répondra à{' '}
          {accuse.email}.
        </p>
        <button type="button" className="btn line sm" onClick={() => setAccuse(null)}>
          Poser une autre question
        </button>
      </div>
    )
  }

  const champ = (nom, label, props = {}) => (
    <div className={`fld${erreurs[nom] ? ' bad' : ''}`}>
      <label htmlFor={`q-${nom}`}>{label}</label>
      {props.multiline ? (
        <textarea id={`q-${nom}`} name={nom} rows={5} value={form[nom]} onChange={change} aria-invalid={!!erreurs[nom]} />
      ) : (
        <input id={`q-${nom}`} name={nom} type={props.type ?? 'text'} autoComplete={props.autoComplete} value={form[nom]} onChange={change} aria-invalid={!!erreurs[nom]} />
      )}
      {erreurs[nom] && (
        <span className="err" role="alert">
          {erreurs[nom]}
        </span>
      )}
    </div>
  )

  return (
    <form className="form" onSubmit={soumettre} noValidate>
      <h2>Poser une question à {institut.nom}</h2>
      {formation && <p style={{ color: 'var(--muted)' }}>À propos de la formation « {formation.nom} ».</p>}

      {champ('nom', 'Votre nom', { autoComplete: 'name' })}
      {champ('email', 'Votre e-mail', { type: 'email', autoComplete: 'email' })}
      {champ('question', 'Votre question', { multiline: true })}

      {erreurServeur && (
        <div className="err" role="alert">
          {erreurServeur}
        </div>
      )}

      <div className="formfoot">
        <button type="submit" className="btn" disabled={envoi}>
          {envoi ? 'Envoi…' : 'Envoyer ma question'}
        </button>
      </div>
    </form>
  )
}
