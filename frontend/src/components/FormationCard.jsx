import { Link } from 'react-router-dom';
import { useFavoris } from '../context/favoris-context';
import { ROUTES } from '../routes';
import { formatDuration, formatFcfa } from '../utils/format';
import AgrementBadge from './AgrementBadge';
import Icon from './Icon';

// Carte d'une formation (accueil, fiche institut, favoris). `program` a la forme ProgramSummary du contrat.
// Deux .fcard imbriquées : l'extérieure porte le cœur (positionné par rapport à elle),
// l'intérieure est le lien, pour que le bouton ne soit pas dans le <a>.
export default function FormationCard({ program }) {
  const { isFavori, toggle } = useFavoris();
  const favori = isFavori(program.id);
  const { institute, domain } = program;

  return (
    <div className="fcard">
      <button
        className="heart"
        type="button"
        aria-pressed={favori}
        aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onClick={() => toggle(program.id)}
      >
        <Icon name="heart" />
      </button>

      <Link className="fcard" to={ROUTES.formation(program.id)}>
        <div className="cover" style={{ background: domain.color }}>
          <div className="pat" />
          <div className="blob" />
          <Icon name={domain.id} className="big" />
          <span className="inst">{institute.short_name}</span>
          <span className="dip">{program.degree.name}</span>
        </div>
        <div className="t">
          <h3>{program.name}</h3>
          <span className="dur">{formatDuration(program.duration)}</span>
        </div>
        <p className="meta">
          {institute.name} · {institute.district}
        </p>
        <div>
          <AgrementBadge institute={institute} />
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
          <b className="num">{formatFcfa(program.tuition)}</b> par an
        </p>
      </Link>
    </div>
  );
}
