import { useEffect } from 'react';

// Fenêtre de confirmation, par exemple avant une suppression. Échap, un clic à côté
// ou « Annuler » la ferment. `busy` bloque les boutons pendant l'appel à l'API.
//
//   <ConfirmDialog title="Supprimer l'institut ?" message="…" onConfirm={remove} onCancel={close} />
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmer', busy = false, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <div className="mbox" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="mact">
          <button className="btn line" type="button" disabled={busy} onClick={onCancel}>
            Annuler
          </button>
          <button className="btn danger" type="button" disabled={busy} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
