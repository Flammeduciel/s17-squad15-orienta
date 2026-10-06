import { useEffect } from 'react';

// Fenêtre de confirmation avant une suppression.
//   <ConfirmDialog title="Supprimer ?" body="…" onConfirm={…} onCancel={…} />
export default function ConfirmDialog({ title, body, onConfirm, onCancel }) {
  // Échap ferme la fenêtre.
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="modal" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className="mbox" role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="mact">
          <button className="btn line" type="button" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn danger" type="button" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
