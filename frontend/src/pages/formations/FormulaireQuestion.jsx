import { useState } from 'react'
import { envoyerQuestion } from '../../api/contact'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function FormulaireQuestion({ institut, formation, envoyer = envoyerQuestion }) {
  const [form, setForm] = useState({ nom: '', email: '', question: '' })
  const [erreurs, setErreurs] = useState({})
  const [erreurServeur, setErreurServeur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [accuse, setAccuse] = useState('')

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const valider = () => {
    const e = {}
    const programId = Number(formation?.id)
    if (!Number.isInteger(programId) || programId < 1) {
      e.formation = 'Cette formation ne peut pas recevoir de question pour le moment.'
    }
    if (!form.nom.trim()) e.nom = 'Indiquez votre nom.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Cette adresse e-mail est incomplète.'
    if (form.question.trim().length < 10) e.question = 'Votre question est trop courte (10 caractères minimum).'
    return e
  }

  const soumettre = async (ev) => {
    ev.preventDefault()
    if (envoi) return
    setErreurServeur('')
    const erreursFormulaire = valider()
    setErreurs(erreursFormulaire)
    if (Object.keys(erreursFormulaire).length) return

    setEnvoi(true)
    try {
      await envoyer({
        program_id: Number(formation.id),
        name: form.nom.trim(),
        email: form.email.trim(),
        message: form.question.trim(),
      })
      setAccuse(form.email.trim())
      setForm({ nom: '', email: '', question: '' })
    } catch (ex) {
      if (ex.status === 429) setErreurServeur('Trop de demandes. Réessayez dans quelques minutes.')
      else if (ex.status === 0) setErreurServeur(ex.message)
      else if (ex.status === 400 || ex.status === 404) setErreurServeur(ex.message || 'Certains champs sont invalides.')
      else setErreurServeur("Votre question n'a pas pu être envoyée. Réessayez.")
    } finally {
      setEnvoi(false)
    }
  }

  if (accuse) {
    return (
      <div className="ok" role="status">
        <b>Question envoyée.</b>
        <p>
          {institut?.nom ?? institut?.name ?? 'L’institut'} a bien reçu votre question
          {formation ? ` à propos de « ${formation.nom ?? formation.name} »` : ''}. L’institut vous répondra à{' '}
          {accuse}.
        </p>
        <button type="button" className="btn line sm" onClick={() => setAccuse('')}>
          Poser une autre question
        </button>
      </div>
    )
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
          aria-invalid={!!erreurs[nom]}
        />
      ) : (
        <input
          id={`q-${nom}`}
          name={nom}
          type={props.type ?? 'text'}
          autoComplete={props.autoComplete}
          value={form[nom]}
          onChange={change}
          aria-invalid={!!erreurs[nom]}
        />
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
      <h2>Poser une question à {institut?.nom ?? institut?.name ?? 'l’institut'}</h2>
      {formation && (
        <p style={{ color: 'var(--muted)' }}>
          À propos de la formation « {formation.nom ?? formation.name} ».
        </p>
      )}
      {erreurs.formation && <span className="err" role="alert">{erreurs.formation}</span>}

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
