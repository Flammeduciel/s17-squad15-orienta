import { Link } from 'react-router-dom';
import { formationPath } from '../routes';

// Petite carte de formation : un titre et une ligne de détail.
export default function MiniCard({ program, detail }) {
  return (
    <Link className="mini" to={formationPath(program.id)}>
      <b>{program.name}</b>
      <small>{detail}</small>
    </Link>
  );
}
