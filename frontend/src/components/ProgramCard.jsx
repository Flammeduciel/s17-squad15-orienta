import { Link } from 'react-router-dom';
import { formationPath } from '../routes';
import { ans, fcfa } from '../utils/format';
import AccreditationBadge from './AccreditationBadge';
import FavoriteButton from './FavoriteButton';
import Icon from './Icon';

const linkStyle = { textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10 };
const degreeStyle = {
  position: 'absolute',
  left: 12,
  top: 12,
  background: '#fff',
  color: '#14201B',
  fontSize: 13,
  fontWeight: 800,
  padding: '5px 10px',
  borderRadius: 99,
};

// Carte d'une formation, utilisée dans toutes les grilles.
export default function ProgramCard({ program }) {
  const { institute, domain } = program;

  return (
    <div className="fcard">
      <FavoriteButton programId={program.id} />
      <Link to={formationPath(program.id)} style={linkStyle}>
        <div style={{ position: 'relative' }}>
          <div className="cover" style={{ background: domain.color }}>
            <div className="pat" />
            <div className="blob" />
            <Icon name={domain.icon} className="big" />
            <span className="inst">{institute.short_name}</span>
          </div>
          <span className="dip" style={degreeStyle}>
            {program.degree.name}
          </span>
        </div>
        <div className="t">
          <h3>{program.name}</h3>
          <span className="dur">{ans(program.duration)}</span>
        </div>
        <p className="meta">
          {institute.name} · {institute.district}
        </p>
        <div style={{ marginTop: -6 }}>
          <AccreditationBadge institute={institute} />
        </div>
        <p className="jobs">
          <b>Débouchés :</b> {program.careers.join(', ')}
        </p>
        <div className="tags">
          {program.evening && <span className="tag">Cours du soir</span>}
          {program.internship_months > 0 && <span className="tag">Stage {program.internship_months} mois</span>}
          {program.installments && <span className="tag">Paiement en tranches</span>}
        </div>
        <p className="price">
          <b className="num">{fcfa(program.tuition)}</b> par an
        </p>
      </Link>
    </div>
  );
}
