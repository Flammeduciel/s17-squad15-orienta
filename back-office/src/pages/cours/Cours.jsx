/* Cours — route /admin/cours (ticket P19).
   Maquette : template/back-office.html. */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createCours, deleteCours, listCours, listFormations, updateCours } from '../../api/cours.js'
import Icon from '../../components/Icon.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import Pager from '../../components/ui/Pager.jsx'
import { useToast } from '../../context/toast-context.js'
import CoursForm from './CoursForm.jsx'
import { libForme, niveau, norm, parNom, pluriel } from './helpers.js'
 
const PER_PAGE = 10

function Cours() {
  const toast = useToast()
  // Le filtre « formation » vit dans l'adresse (?formation=compta) : une fiche formation peut y renvoyer.
  const [params, setParams] = useSearchParams()
  const forme = params.get('formation') ?? ''

  const [cours, setCours] = useState([])
  const [formations, setFormations] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null | { id: string | null }
  const [toDelete, setToDelete] = useState(null)
  const [attach, setAttach] = useState({ cours: '', annee: 1 })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [c, f] = await Promise.all([listCours(), listFormations()])
      setCours(c)
      setFormations(f)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    document.title = 'Cours — Espace Squad'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial des données
    load()
  }, [load])

  const formationsTriees = useMemo(
    () => [...formations].sort((a, b) => libForme(a).localeCompare(libForme(b), 'fr')),
    [formations],
  )
  const formationFiltree = formations.find((f) => f.id === forme)
  const formeActive = formationFiltree ? forme : '' // un filtre sur une formation inconnue est ignoré
  const formeDe = (id) => formations.find((f) => f.id === id)
  const lienDe = (c) => c.liens.find((l) => l.formation === formeActive)

  const rows = useMemo(() => {
    const needle = norm(q)
    return cours
      .filter((c) => (!formeActive || c.liens.some((l) => l.formation === formeActive)) && (!needle || norm(c.nom).includes(needle)))
      .sort((a, b) => {
        const ya = formeActive ? a.liens.find((l) => l.formation === formeActive).annee : 0
        const yb = formeActive ? b.liens.find((l) => l.formation === formeActive).annee : 0
        return ya - yb || parNom(a, b)
      })
  }, [cours, q, formeActive])

  const pageCourante = Math.min(page, Math.max(1, Math.ceil(rows.length / PER_PAGE)))
  const visibles = rows.slice((pageCourante - 1) * PER_PAGE, pageCourante * PER_PAGE)
  const libres = formeActive ? cours.filter((c) => !lienDe(c)).sort(parNom) : []
  const attachCours = libres.some((c) => c.id === attach.cours) ? attach.cours : (libres[0]?.id ?? '')
  const dureeFiltree = formationFiltree?.duree ?? 1

  const editedCours = editing?.id ? cours.find((c) => c.id === editing.id) : null
  const isTaken = (nom, selfId) => cours.some((c) => c.id !== selfId && norm(c.nom) === norm(nom))

  const setFiltre = (id) => {
    setParams(id ? { formation: id } : {}, { replace: true })
    setPage(1)
  }

  // --- Actions -------------------------------------------------------------

  const saveCours = async ({ nom, liens }) => {
    if (editing.id) {
      await updateCours(editing.id, { nom, liens })
      toast('Cours mis à jour.')
      setEditing(null)
    } else {
      await createCours({ nom, liens })
      toast(`« ${nom} » ajouté${liens.length ? ` et rattaché à ${pluriel(liens.length, 'formation')}` : ' au catalogue'}.`)
    }
    setCours(await listCours())
  }

  // Rattacher / retirer = renvoyer la liste complète des liens du cours.
  const rattacher = async () => {
    const c = cours.find((x) => x.id === attachCours)
    if (!c) return
    try {
      await updateCours(c.id, { nom: c.nom, liens: [...c.liens, { formation: formeActive, annee: attach.annee }] })
      toast(`« ${c.nom} » rattaché à « ${formationFiltree.nom} ».`)
      setCours(await listCours())
    } catch {
      toast('Rattachement impossible. Réessayez.', true)
    }
  }

  const retirer = async (c) => {
    try {
      await updateCours(c.id, { nom: c.nom, liens: c.liens.filter((l) => l.formation !== formeActive) })
      toast(`« ${c.nom} » retiré de cette formation. Il reste au catalogue.`)
      setCours(await listCours())
    } catch {
      toast('Retrait impossible. Réessayez.', true)
    }
  }

  const supprimer = async () => {
    const c = toDelete
    setToDelete(null)
    try {
      await deleteCours(c.id)
      if (editing?.id === c.id) setEditing(null)
      toast(`« ${c.nom} » supprimé du catalogue.`)
      setCours(await listCours())
    } catch {
      toast('Suppression impossible. Réessayez.', true)
    }
  }

  // --- Affichage -----------------------------------------------------------

  if (status === 'loading') return <p style={{ color: 'var(--muted)' }}>Chargement des cours…</p>
  if (status === 'error') {
    return (
      <div className="empty">
        <h3>Impossible de charger les cours</h3>
        <p>Le serveur ne répond pas. Vérifiez votre connexion puis réessayez.</p>
        <button className="btn" type="button" onClick={load}>
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Cours</h1>
          <p>
            {pluriel(cours.length, 'cours', 'cours')} au catalogue. Un même cours peut être rattaché à plusieurs
            formations, chacune avec son année d'études.
          </p>
        </div>
        {!editing && (
          <button className="btn" type="button" onClick={() => setEditing({ id: null })}>
            <Icon name="plus" />
            Ajouter un cours
          </button>
        )}
      </div>

      {editing && (
        <CoursForm
          key={editing.id ?? 'nouveau'}
          initial={editedCours}
          defaultLiens={formeActive ? [{ formation: formeActive, annee: 1 }] : []}
          formations={formations}
          isTaken={isTaken}
          onSubmit={saveCours}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="panel">
        <header>
          <div className="toolbar">
            <span className="field">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Rechercher un cours"
                aria-label="Rechercher"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setPage(1)
                }}
              />
            </span>
            <select
              className="field"
              aria-label="Filtrer par formation"
              value={formeActive}
              onChange={(e) => setFiltre(e.target.value)}
            >
              <option value="">Toutes les formations</option>
              {formationsTriees.map((f) => (
                <option key={f.id} value={f.id}>
                  {libForme(f)}
                </option>
              ))}
            </select>
          </div>
          <small>{pluriel(rows.length, 'résultat')}</small>
        </header>

        {/* Formation filtrée : on peut lui rattacher directement un cours déjà au catalogue. */}
        {formeActive && libres.length > 0 && (
          <div className="attach">
            <b style={{ fontSize: 14 }}>Rattacher un cours existant</b>
            <select
              aria-label="Cours à rattacher"
              value={attachCours}
              onChange={(e) => setAttach((a) => ({ ...a, cours: e.target.value }))}
            >
              {libres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            <select
              aria-label="Année d'études pour le rattachement"
              style={{ flex: '0 1 150px' }}
              value={Math.min(attach.annee, dureeFiltree)}
              onChange={(e) => setAttach((a) => ({ ...a, annee: Number(e.target.value) }))}
            >
              {Array.from({ length: dureeFiltree }, (_, k) => (
                <option key={k} value={k + 1}>
                  {niveau(k)}
                </option>
              ))}
            </select>
            <button className="btn sm" type="button" onClick={rattacher}>
              <Icon name="plus" />
              Rattacher
            </button>
          </div>
        )}

        {visibles.length > 0 ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>{formeActive ? 'Année' : 'Formations rattachées'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((c) => {
                    const noms = c.liens.map((l) => libForme(formeDe(l.formation)))
                    return (
                      <tr key={c.id}>
                        <td>
                          <b>{c.nom}</b>
                        </td>
                        <td>
                          {formeActive ? (
                            <>
                              {niveau(lienDe(c).annee - 1)}
                              {c.liens.length > 1 && (
                                <>
                                  <br />
                                  <small style={{ color: 'var(--muted)' }}>
                                    aussi dans {c.liens.length - 1} autre{c.liens.length > 2 ? 's' : ''} formation
                                    {c.liens.length > 2 ? 's' : ''}
                                  </small>
                                </>
                              )}
                            </>
                          ) : noms.length ? (
                            <>
                              <span className={`badge ${noms.length > 1 ? 'ok' : 'wait'}`}>
                                {pluriel(noms.length, 'formation')}
                              </span>
                              <br />
                              <small style={{ color: 'var(--muted)' }}>
                                {noms.slice(0, 2).join(' · ')}
                                {noms.length > 2 ? ' …' : ''}
                              </small>
                            </>
                          ) : (
                            <span className="badge wait">Aucune</span>
                          )}
                        </td>
                        <td>
                          <div className="acts">
                            {formeActive && (
                              <button
                                className="act"
                                type="button"
                                title="Retirer de cette formation"
                                aria-label={`Retirer ${c.nom} de cette formation`}
                                onClick={() => retirer(c)}
                              >
                                <Icon name="x" />
                              </button>
                            )}
                            <button
                              className="act"
                              type="button"
                              title="Modifier"
                              aria-label={`Modifier ${c.nom}`}
                              onClick={() => {
                                setEditing({ id: c.id })
                                window.scrollTo(0, 0)
                              }}
                            >
                              <Icon name="pencil" />
                            </button>
                            <button
                              className="act del"
                              type="button"
                              title="Supprimer du catalogue"
                              aria-label={`Supprimer ${c.nom}`}
                              onClick={() => setToDelete(c)}
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pager total={rows.length} perPage={PER_PAGE} page={pageCourante} onPage={setPage} />
          </>
        ) : (
          <div className="pad">
            <div className="empty">
              <h3>Aucun cours</h3>
              <p>
                {formeActive && !q
                  ? "Cette formation n'a pas encore de cours : rattachez-en un ou ajoutez-en un nouveau."
                  : 'Modifiez la recherche ou le filtre.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce cours ?"
          body={`« ${toDelete.nom} » sera supprimé du catalogue${
            toDelete.liens.length ? ` et retiré du programme de ${pluriel(toDelete.liens.length, 'formation')}` : ''
          }. Cette action est définitive.`}
          confirmLabel="Confirmer"
          onConfirm={supprimer}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}

export default Cours
