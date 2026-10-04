import Icon from './Icon';

// Badge bleu d'un institut agréé, avec son numéro (EX-05).
// Un institut non agréé n'affiche rien : son nom seul (EX-14).
export default function AccreditationBadge({ institute }) {
  if (!institute.accredited) return null;
  return (
    <span className="agb">
      <Icon name="check" />
      Agréé · {institute.accreditation_number}
    </span>
  );
}
