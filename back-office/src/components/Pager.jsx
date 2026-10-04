// Pied de liste : nombre d'éléments et changement de page.
//   <Pager total={rows.length} perPage={8} page={page} onPage={setPage} />
export default function Pager({ total, perPage, page, onPage }) {
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

  const first = (page - 1) * perPage + 1;
  const last = Math.min(total, page * perPage);
  return (
    <div className="pager">
      <span>
        {first} – {last} sur {total}
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
