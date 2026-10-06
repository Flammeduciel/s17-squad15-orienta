// Débouchés — route /admin/debouches (ticket P21).
// Maquette : template/back-office.html (pageRefl).
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import Referentiel from './Referentiel';
import { DEBOUCHES } from './referentiels';

function Debouches() {
  const domaines = useFetch('/domains');

  if (domaines.error) return <Status error={domaines.error} onRetry={domaines.reload} />;
  if (!domaines.data) return <Status loading />;

  return <Referentiel config={DEBOUCHES} extra={{ domaines: domaines.data }} />;
}

export default Debouches;