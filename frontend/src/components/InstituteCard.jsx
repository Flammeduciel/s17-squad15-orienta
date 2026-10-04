import { Link } from 'react-router-dom';
import { institutPath } from '../routes';
import { fcfa, imageUrl, pluriel } from '../utils/format';
import AccreditationBadge from './AccreditationBadge';

const linkStyle = { textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10 };
const photoStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

// Carte d'un institut : son image (ou son sigle sur fond de couleur), son
// arrondissement, son badge d'agrément, ses formations et ses frais d'inscription.
// programCount et degrees sont ceux à afficher (toutes ses formations, ou
// seulement celles qui correspondent aux filtres).
export default function InstituteCard({ institute, programCount, degrees }) {
  return (
    <div className="fcard">
      <Link to={institutPath(institute.id)} style={linkStyle}>
        <div className="cover" style={{ background: institute.color }}>
          <div className="pat" />
          <div className="blob" />
          {institute.image_url ? (
            <img src={imageUrl(institute.image_url)} alt="" style={photoStyle} />
          ) : (
            <span className="big-sigle">{institute.short_name}</span>
          )}
        </div>
        <div className="t">
          <h3>{institute.name}</h3>
        </div>
        <p className="meta">
          {institute.district}, {institute.city}
        </p>
        <div style={{ marginTop: -6 }}>
          <AccreditationBadge institute={institute} />
        </div>
        <p className="jobs">
          <b>
            {pluriel(programCount, 'formation')}
            {programCount > 0 ? ' :' : ''}
          </b>{' '}
          {degrees.join(', ')}
        </p>
        <p className="price">
          Inscription <b className="num">{fcfa(institute.registration_fee)}</b>
        </p>
      </Link>
    </div>
  );
}
