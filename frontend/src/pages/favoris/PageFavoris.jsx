import { useEffect, useState } from 'react'
import { rechargerFavoris } from './favorisStore'
import { useFavoris } from './useFavoris'

/* Page « Mes favoris ». Affiche tout de suite les favoris gardés dans le navigateur, puis les
   remet à jour depuis l'API (formation supprimée = retirée de la liste).
   <PageFavoris hrefFormation={(id) => `/formations/${id}`} />
   `fetchOne` est remplaçable (tests, client HTTP de S5). */
export default function PageFavoris({ hrefFormation = (id) => `/formations/${id}`, fetchOne = getFormation }) {
  const { favoris, basculer } = useFavoris()
  const [etat, setEtat] = useState({ chargement: favoris.length > 0, retires: 0, erreurs: 0 })

  useEffect(() => {
    let annule = false
    rechargerFavoris(fetchOne).then((r) => {
      if (!annule) setEtat({ chargement: false, ...r })
    })
    return () => {
      annule = true
    }
    // Une seule actualisation à l'ouverture de la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <h1>Mes favoris</h1>
      <p style={{ color: 'var(--muted)' }}>
        Les formations que vous avez gardées de côté. Elles restent sur cet appareil.
      </p>

      {etat.chargement && <p role="status">Actualisation des formations…</p>}
      {etat.retires > 0 && (
        <p className="ok" role="status">
          {etat.retires === 1
            ? "1 formation n'existe plus et a été retirée de vos favoris."
            : `${etat.retires} formations n'existent plus et ont été retirées de vos favoris.`}
        </p>
      )}
      {etat.erreurs > 0 && (
        <p className="err" role="alert">
          Certaines formations n'ont pas pu être actualisées. Les informations affichées peuvent dater.
        </p>
      )}

      {favoris.length === 0 ? (
        <div className="empty">
          <h3>Aucun favori</h3>
          <p>Ajoutez une formation avec le bouton « Favoris » pour la retrouver ici.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {favoris.map((f) => (
            <li key={f.id} className="rowc">
              <div className="hd">
                <div className="who">
                  <b>
                    <a href={hrefFormation(f.id)}>{f.nom}</a>
                  </b>
                  <small>{[f.institut, f.diplome].filter(Boolean).join(' · ')}</small>
                </div>
                <button
                  type="button"
                  className="btn line sm"
                  aria-label={`Retirer ${f.nom} des favoris`}
                  onClick={() => basculer(f)}
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
