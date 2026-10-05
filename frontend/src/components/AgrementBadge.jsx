import Icon from './Icon';

// Badge bleu avec le numéro d'agrément ; un institut non agréé n'a pas de badge, son nom seul suffit.
export default function AgrementBadge({ institute }) {
  if (!institute.accredited) return null;

  return (
    <span className="agb">
      <Icon name="check" />
      Agréé{institute.accreditation_number ? ` · ${institute.accreditation_number}` : ''}
    </span>
  );
}
