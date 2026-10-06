// Domaines d'insertion — route /admin/domaines (ticket P23).
// Maquette : template/back-office.html (pageRefl).
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import Referentiel from './Referentiel';
import { DOMAINES } from './referentiels';

function Domaines() {
  const programs = useFetch('/admin/programs');
  const careers = useFetch('/admin/careers');

  const failed = programs.error || careers.error;
  if (failed) {
    return <Status error={failed} onRetry={programs.error ? programs.reload : careers.reload} />;
  }
  if (!programs.data || !careers.data) {
    return <Status loading />;
  }

  return (
    <Referentiel
      config={DOMAINES}
      extra={{ programs: programs.data.items, careers: careers.data }}
    />
  );
}

export default Domaines;