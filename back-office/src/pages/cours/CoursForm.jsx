import { useRef, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { libForme, niveau } from './helpers.js'

let nextKey = 0
const newRow = (formation, annee = 1) => ({ key: ++nextKey, formation, annee })

/* Formulaire d'ajout ou de modification d'un cours, avec ses formations rattachées.
   - initial : le cours à modifier, ou null pour un ajout
   - defaultLiens : formations proposées d'office à l'ajout (celle du filtre en cours)
   - onSubmit({ nom, liens }) : renvoie une promesse ; rejetée, son message s'affiche sous l'intitulé
   En ajout, le formulaire reste ouvert après l'envoi pour enchaîner plusieurs cours. */
export default function CoursForm({ initial, defaultLiens = [], formations, isTaken, onSubmit, onCancel }) {
  const [nom, setNom] = useState(initial?.nom ?? '')
  const [rows, setRows] = useState(() =>
    (initial?.liens ?? defaultLiens).filter((l) => formations.some((f) => f.id === l.formation)).map((l) => newRow(l.formation, l.annee)),
  )
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const nomRef = useRef(null)

  const sorted = [...formations].sort((a, b) => libForme(a).localeCompare(libForme(b), 'fr'))
  const dureeDe = (id) => formations.find((f) => f.id === id)?.duree ?? 1

  const patchRow = (key, patch) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  // Changer de formation ramène l'année dans la durée du nouveau diplôme.
  const changeFormation = (row, formation) =>
    patchRow(row.key, { formation, annee: Math.min(row.annee, dureeDe(formation)) })

  const addRow = () => {
    const libre = sorted.find((f) => !rows.some((r) => r.formation === f.id))
    if (!libre) {
      setErrors({ liens: 'Ce cours est déjà rattaché à toutes les formations.' })
      return
    }
    setErrors({})
    setRows((list) => [...list, newRow(libre.id)])
  }

  const submit = async (e) => {
    e.preventDefault()
    const name = nom.trim()
    const err = {}
    if (!name) err.nom = "L'intitulé est obligatoire."
    else if (isTaken(name, initial?.id)) {
      err.nom = 'Ce cours existe déjà au catalogue : modifiez-le pour le rattacher à d\'autres formations.'
    }
    const double = rows.find((r, i) => rows.findIndex((x) => x.formation === r.formation) !== i)
    if (double) {
      err.liens = `« ${formations.find((f) => f.id === double.formation)?.nom} » est rattachée deux fois.`
    }
    setErrors(err)
    if (err.nom || err.liens) return

    setSubmitting(true)
    try {
      await onSubmit({ nom: name, liens: rows.map((r) => ({ formation: r.formation, annee: r.annee })) })
      if (!initial) {
        setNom('')
        nomRef.current?.focus()
      }
    } catch (ex) {
      setErrors({ nom: ex.status === 409 ? 'Ce cours existe déjà au catalogue.' : (ex.message || 'Enregistrement impossible. Réessayez.') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <fieldset>
        <legend>{initial ? 'Modifier le cours' : 'Ajouter un cours'}</legend>

        <div className="row">
          <div className={`fld${errors.nom ? ' bad' : ''}`}>
            <label htmlFor="c-nom">Intitulé du cours</label>
            <input
              id="c-nom"
              ref={nomRef}
              autoFocus
              value={nom}
              placeholder="ex. Français"
              aria-invalid={!!errors.nom}
              onChange={(e) => setNom(e.target.value)}
            />
            {errors.nom && (
              <span className="err" role="alert">
                {errors.nom}
              </span>
            )}
          </div>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <div className={`fld${errors.liens ? ' bad' : ''}`}>
            <label id="liens-label">Formations rattachées</label>
            <div role="group" aria-labelledby="liens-label">
              {rows.map((r) => (
                <div className="lien" key={r.key}>
                  <select
                    className="lien-forme"
                    aria-label="Formation"
                    value={r.formation}
                    onChange={(e) => changeFormation(r, e.target.value)}
                  >
                    {sorted.map((f) => (
                      <option key={f.id} value={f.id}>
                        {libForme(f)} ({f.diplome})
                      </option>
                    ))}
                  </select>
                  <select
                    className="lien-annee"
                    aria-label="Année d'études"
                    value={r.annee}
                    onChange={(e) => patchRow(r.key, { annee: Number(e.target.value) })}
                  >
                    {Array.from({ length: dureeDe(r.formation) }, (_, k) => (
                      <option key={k} value={k + 1}>
                        {niveau(k)}
                      </option>
                    ))}
                  </select>
                  <button
                    className="act del"
                    type="button"
                    title="Retirer cette formation"
                    aria-label="Retirer cette formation"
                    onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))}
                  >
                    <Icon name="x" />
                  </button>
                </div>
              ))}
            </div>
            {formations.length > 0 && (
              <button className="btn line sm" type="button" onClick={addRow}>
                <Icon name="plus" />
                Rattacher à une formation
              </button>
            )}
            {errors.liens && (
              <span className="err" role="alert">
                {errors.liens}
              </span>
            )}
            <span className="hint" style={{ display: 'block' }}>
              Les années proposées viennent du diplôme de chaque formation. Un cours sans formation reste au
              catalogue.
            </span>
          </div>
        </div>
      </fieldset>

      <div className="formfoot">
        <button className="btn" type="submit" disabled={submitting}>
          {initial ? 'Enregistrer les modifications' : 'Ajouter le cours'}
        </button>
        <button className="btn line" type="button" onClick={onCancel}>
          {initial ? 'Annuler' : 'Terminer'}
        </button>
      </div>
    </form>
  )
}
