// Pied de tableau : « 1 – 10 sur 26 » et boutons Précédent / Suivant (page numérotée à partir de 1).
// Avec une seule page, seul le total s'affiche.
export default function Pagination({ total, page, perPage, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));

  if (pages <= 1) {
    return (
      <div className="pager">
        <span>
          {total} élément{total > 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  const start = (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  return (
    <div className="pager">
      <span>
        {start} – {end} sur {total}
      </span>
      <span className="p">
        <button className="btn line sm" type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Précédent
        </button>
        <b>
          Page {page} / {pages}
        </b>
        <button className="btn line sm" type="button" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Suivant
        </button>
      </span>
    </div>
  );
}
