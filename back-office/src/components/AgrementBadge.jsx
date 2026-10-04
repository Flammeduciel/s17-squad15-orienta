import Icon from './Icon';

// Numéro d'agrément en badge bleu, ou « Non agréé » (l'API renvoie `accredited` et le numéro).
export default function AgrementBadge({ institute }) {
  if (!institute.accredited) return <span className="agb p">Non agréé</span>;

  return (
    <span className="agb">
      <Icon name="check" />
      {institute.accreditation_number}
    </span>
  );
}
