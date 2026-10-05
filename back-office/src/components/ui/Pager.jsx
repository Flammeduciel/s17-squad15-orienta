// Pagination de la maquette (.pager). Réutilisable par toutes les listes (formations, instituts, cours…).
// Ne s'affiche pas quand tout tient sur une page.
export default function Pager({ total, perPage, page, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  if (total <= perPage) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(total, page * perPage)

  return (
    <div className="pager">
      <span>
        {from}–{to} sur {total}
      </span>
      <div className="p">
        <button
          className="btn line sm"
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Précédent
        </button>
        <span>
          Page {page} / {pages}
        </span>
        <button
          className="btn line sm"
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
