import { useEffect } from 'react'

// Fenêtre de confirmation de la maquette (.modal). Échap ou clic à côté = annuler.
export default function ConfirmDialog({ title, body, confirmLabel = 'Confirmer', onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="mbox" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <p>{body}</p>
        <div className="mact">
          <button className="btn line" type="button" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn danger" type="button" onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
