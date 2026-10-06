// Séries du bac — route /admin/series (ticket P22).
// Maquette : template/back-office.html (pageRefl).
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import Referentiel from './Referentiel';
import { SERIES } from './referentiels';

function SeriesBac() {
  const programs = useFetch('/admin/programs');

  if (programs.error) return <Status error={programs.error} onRetry={programs.reload} />;
  if (!programs.data) return <Status loading />;

  return <Referentiel config={SERIES} extra={{ programs: programs.data.items }} />;
}

export default SeriesBac;