import { useEffect } from 'react';
import Icon from './Icon';

/**
 * Fenêtre qui s'ouvre par-dessus la page, pour un formulaire d'ajout ou de
 * modification.
 *
 *   <Modal title="Ajouter un diplôme" onClose={() => setEditing(null)}>
 *     <form>…</form>
 *   </Modal>
 *
 * - size : 'medium' (petit formulaire) ou 'large' (formulaire à plusieurs blocs).
 * - Elle se ferme avec la croix ou la touche Échap. Un clic à côté ne la ferme
 *   pas : on ne perd pas une saisie par accident.
 */
export default function Modal({ title, subtitle, size = 'large', onClose, children }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal">
      <div className={`mbox ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mhead">
          <div>
            <h3>{title}</h3>
            {subtitle && <p style={{ marginTop: 6 }}>{subtitle}</p>}
          </div>
          <button className="act" type="button" title="Fermer" aria-label="Fermer" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
