// Diplômes — route /admin/diplomes (ticket P20).
// Maquette : template/back-office.html (pageRefl).
import Referentiel from './Referentiel';
import { DIPLOMES } from './referentiels';

function Diplomes() {
  return <Referentiel config={DIPLOMES} />;
}

export default Diplomes;