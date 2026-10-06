import { useRef } from 'react';
import Icon from '../../components/Icon';
import { IMAGE_TYPES, imageError } from './formulaire';

/**
 * Aperçu de l'image d'un institut, avec « Choisir / Changer » et « Retirer ».
 *   - `shown` : adresse de l'image à montrer (image enregistrée ou fichier choisi), ou null ;
 *   - sans image, l'aperçu montre le sigle sur la couleur de l'institut.
 * Le fichier choisi est contrôlé ici (type, taille) puis transmis par `onPick` ; il part à l'enregistrement.
 */
export default function ImageInstitut({ shown, sigle, color, onPick, onRemove, onError }) {
  const input = useRef(null);

  function pick(event) {
    const chosen = event.target.files[0];
    event.target.value = ''; // permet de rechoisir le même fichier après l'avoir retiré
    if (!chosen) return;
    const error = imageError(chosen);
    if (error) onError(error);
    else onPick(chosen);
  }

  return (
    <div className="logoedit" role="group" aria-labelledby="image-label">
      <div className="ap" style={{ background: shown ? '#fff' : color }}>
        {shown ? <img src={shown} alt={`Aperçu de l'image${sigle ? ` de ${sigle}` : ''}`} /> : sigle || 'IMAGE'}
      </div>
      <div className="cmd">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn line sm" onClick={() => input.current.click()}>
            <Icon name="upload" />
            {shown ? "Changer l'image" : 'Choisir une image'}
          </button>
          {shown && (
            <button type="button" className="btn ghost sm" onClick={onRemove}>
              Retirer
            </button>
          )}
        </div>
        <span className="hint">
          JPEG, PNG ou WebP, 2 Mo maximum. L'image est affichée sur la fiche publique de l'institut.
        </span>
      </div>
      <input ref={input} type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={pick} />
    </div>
  );
}
