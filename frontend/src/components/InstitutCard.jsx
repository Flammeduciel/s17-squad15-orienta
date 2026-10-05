import { Link } from 'react-router-dom';
import { imageUrl } from '../api/http';
import { ROUTES } from '../routes';
import { formatFcfa, plural } from '../utils/format';
import AgrementBadge from './AgrementBadge';

// L'image remplit la couverture ; sans image, c'est le sigle de l'institut sur sa couleur.
const IMAGE_STYLE = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

// Carte d'un institut dans la liste de l'accueil. `institute` a la forme InstituteSummary du contrat.
export default function InstitutCard({ institute }) {
  const image = imageUrl(institute.image_url);

  return (
    <Link className="fcard" to={ROUTES.institut(institute.id)}>
      <div className="cover" style={{ background: institute.color }}>
        <div className="pat" />
        <div className="blob" />
        {image ? <img src={image} alt="" style={IMAGE_STYLE} /> : <span className="big-sigle">{institute.short_name}</span>}
      </div>
      <div className="t">
        <h3>{institute.name}</h3>
      </div>
      <p className="meta">{institute.district}, Brazzaville</p>
      <div>
        <AgrementBadge institute={institute} />
      </div>
      <p className="jobs">
        <b>
          {plural(institute.program_count, 'formation')}
          {institute.program_count > 0 ? ' :' : ''}
        </b>{' '}
        {institute.degrees.join(', ')}
      </p>
      <p className="price">
        Inscription <b className="num">{formatFcfa(institute.registration_fee)}</b>
      </p>
    </Link>
  );
}
