/* Favoris — route /favoris (ticket P3).
   Maquette : template/index.html. */
   import { useFavoris } from './useFavoris'

function Favoris({ formation }) {
   const { favoris, basculer } = useFavoris()
  const actif = favoris.some((f) => String(f.id) === String(formation.id))
  const label = actif ? `Retirer ${formation.nom} des favoris` : `Ajouter ${formation.nom} aux favoris`

  return (
    <button
      type="button"
      className="pill"
      aria-pressed={actif}
      aria-label={label}
      title={actif ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      onClick={() => basculer(formation)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={actif ? 'var(--heart)' : 'none'} stroke={actif ? 'var(--heart)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.5 1.1 4.3 2.5h.6C12.1 6.1 13.6 5 15.6 5 19 5 21.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21Z" />
      </svg>
      <span>{actif ? 'Favori' : 'Favoris'}</span>
    </button>
  )
}

export default Favoris
