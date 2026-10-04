/* Accueil et recherche - route / (ticket P2).
   Maquette : template/index.html. */
import { useEffect, useRef, useState } from 'react';
import {
  getBacSeries,
  getCareers,
  getDegrees,
  getDistricts,
  getDomains,
  getInstitutes,
  getPrograms,
} from '../../api/catalogue';
import Icon from '../../components/Icon';
import { useSearch } from '../../context/search-context';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import FilterPanel from './FilterPanel';
import { searchParams } from './filters';
import Results from './Results';
import SearchBar from './SearchBar';

// Listes de référence de l'accueil (domaines, diplômes, séries, débouchés,
// arrondissements), chargées une seule fois. Elles remplissent les filtres et
// donnent les totaux des quatre accès. Aucun institut ni formation ici.
async function loadLists() {
  const [domains, degrees, bacSeries, careers, districts] = await Promise.all([
    getDomains(),
    getDegrees(),
    getBacSeries(),
    getCareers(),
    getDistricts(),
  ]);
  return { domains, degrees, bacSeries, careers, districts };
}

// Résultats de la grille : on ne demande à l'API que ce que la vue affiche.
// La vue Instituts charge les instituts ; les vues Formations, Diplômes et
// Débouchés chargent les formations.
async function loadResults(kind, params, sort) {
  const items = kind === 'institutes' ? await getInstitutes(params) : await getPrograms({ ...params, sort });
  return { kind, items };
}

// Listes vides, utilisées tant que les données ne sont pas arrivées : l'accueil
// s'affiche tout de suite, et se remplit ensuite.
const EMPTY = { domains: [], degrees: [], bacSeries: [], careers: [], districts: [] };

const sum = (list, key) => list.reduce((total, item) => total + item[key], 0);

function Accueil() {
  const { data: loaded, error: listsError, reload: reloadLists } = useApi(loadLists, []);
  const { filters, change } = useSearch();

  // Le curseur du budget bouge vite : on attend qu'il s'arrête avant d'appeler l'API.
  const budget = useDebounce(filters.budget);
  const params = searchParams({ ...filters, budget });
  const kind = filters.view === 'inst' ? 'institutes' : 'programs';
  const search = useApi(() => loadResults(kind, params, filters.sort), [kind, params, filters.sort]);
  // Pendant une nouvelle recherche, les résultats précédents restent affichés,
  // sauf s'ils sont d'une autre sorte (instituts au lieu de formations).
  const last = search.data ?? search.lastData;
  const found = last && last.kind === kind ? last.items : null;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    document.title = 'Orienta Brazzaville - Les instituts privés de Brazzaville, au même endroit';
  }, []);

  const data = loaded ?? EMPTY;

  const scrollToResults = () => {
    const top = resultsRef.current.offsetTop - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Bouton « Rechercher » : la grille est toujours rechargée depuis l'API, même
  // si le mot n'a pas changé, puis on descend jusqu'aux résultats.
  const onSearch = () => {
    search.reload();
    scrollToResults();
  };

  // Les quatre accès de l'accueil (EX-09) : chacun change ce que la grille affiche.
  const access = [
    { view: 'inst', icon: 'building', label: 'Instituts', total: sum(data.districts, 'institute_count') },
    { view: 'form', icon: 'cap', label: 'Formations', total: sum(data.districts, 'program_count') },
    { view: 'dip', icon: 'award', label: 'Diplômes', total: data.degrees.length },
    { view: 'deb', icon: 'brief', label: 'Débouchés', total: data.careers.length },
  ];

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Trouve ton institut à Brazzaville</h1>
          <p>Instituts privés, formations, diplômes et débouchés : tout au même endroit, sans te déplacer.</p>
          {/* key : quand la recherche appliquée change (rappel retiré, filtres
              effacés), la barre repart de ce texte. */}
          <SearchBar key={filters.q} data={data} onSearch={onSearch} />
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
              <Icon name={domain.icon} />
              {domain.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="wrap layout" ref={resultsRef}>
        <FilterPanel data={data} ready={Boolean(loaded)} open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        <Results
          data={data}
          found={found ?? []}
          loading={!found && !search.error}
          searching={search.loading}
          error={found ? null : search.error || listsError}
          onRetry={() => {
            reloadLists();
            search.reload();
          }}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>
      {filtersOpen && <div className="scrim" onClick={() => setFiltersOpen(false)} />}
    </>
  );
}

export default Accueil
