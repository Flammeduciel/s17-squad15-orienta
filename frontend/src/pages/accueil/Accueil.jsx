/* Accueil et recherche — route / (ticket P2).
   Maquette : template/index.html. */
import { useEffect, useRef, useState } from 'react';
import {
  getBacSeries,
  getDegrees,
  getDistricts,
  getDomains,
  getInstitutes,
  getPrograms,
} from '../../api/catalogue';
import Icon from '../../components/Icon';
import { useSearch } from '../../context/search-context';
import { useApi } from '../../hooks/useApi';
import FilterPanel from './FilterPanel';
import Results from './Results';
import SearchBar from './SearchBar';

// Tout ce dont l'accueil a besoin, chargé en une fois. Le catalogue est petit :
// les filtres s'appliquent ensuite dans le navigateur, sans nouvel appel.
async function loadHome() {
  const [programs, institutes, domains, degrees, bacSeries, districts] = await Promise.all([
    getPrograms(),
    getInstitutes(),
    getDomains(),
    getDegrees(),
    getBacSeries(),
    getDistricts(),
  ]);
  // Débouchés portés par les formations publiées, par ordre alphabétique.
  const careers = [...new Set(programs.flatMap((program) => program.careers))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );
  return {
    programs,
    institutes,
    domains,
    degrees,
    bacSeries,
    careers,
    districts: districts.map((district) => district.name),
  };
}

// Catalogue vide, utilisé tant que les données ne sont pas arrivées : l'accueil
// s'affiche tout de suite, et se remplit ensuite.
const EMPTY = { programs: [], institutes: [], domains: [], degrees: [], bacSeries: [], careers: [], districts: [] };

function Accueil() {
  const { data: loaded, loading, error, reload } = useApi(loadHome, []);
  const { filters, change } = useSearch();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    document.title = 'Orienta Brazzaville — Les instituts privés de Brazzaville, au même endroit';
  }, []);

  const data = loaded ?? EMPTY;

  const scrollToResults = () => {
    const top = resultsRef.current.offsetTop - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Les quatre accès de l'accueil (EX-09) : chacun change ce que la grille affiche.
  const access = [
    { view: 'inst', icon: 'building', label: 'Instituts', total: data.institutes.length },
    { view: 'form', icon: 'cap', label: 'Formations', total: data.programs.length },
    { view: 'dip', icon: 'award', label: 'Diplômes', total: data.degrees.length },
    { view: 'deb', icon: 'brief', label: 'Débouchés', total: data.careers.length },
  ];

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Trouve ton institut à Brazzaville</h1>
          <p>Instituts privés, formations, diplômes et débouchés : tout au même endroit, sans te déplacer.</p>
          <SearchBar data={data} onSearch={scrollToResults} />
          <div className="access" role="group" aria-label="Parcourir">
            {access.map((item) => (
              <button
                className="acc"
                type="button"
                key={item.view}
                aria-pressed={filters.view === item.view}
                onClick={() => {
                  change({ view: item.view });
                  scrollToResults();
                }}
              >
                <Icon name={item.icon} />
                <span>
                  <b>{item.label}</b>
                  {/* Tant que le catalogue n'est pas là, le compte est remplacé par « … ». */}
                  <small>{loaded ? item.total : '…'} à Brazzaville</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <nav className="cats" aria-label="Domaines">
        <div className="wrap">
          <button className="cat" type="button" aria-pressed={!filters.domain} onClick={() => change({ domain: '' })}>
            <Icon name="all" />
            Tout
          </button>
          {data.domains.map((domain) => (
            <button
              className="cat"
              type="button"
              key={domain.id}
              aria-pressed={filters.domain === domain.id}
              onClick={() => change({ domain: domain.id })}
            >
              <Icon name={domain.id} />
              {domain.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="wrap layout" ref={resultsRef}>
        <FilterPanel data={data} ready={Boolean(loaded)} open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        <Results
          data={data}
          loading={loading}
          error={error}
          onRetry={reload}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>
      {filtersOpen && <div className="scrim" onClick={() => setFiltersOpen(false)} />}
    </>
  );
}

export default Accueil
