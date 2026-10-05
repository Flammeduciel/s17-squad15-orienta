import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FormationCard from '../../components/FormationCard';
import Icon from '../../components/Icon';
import InstitutCard from '../../components/InstitutCard';
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import { formatDuration, plural } from '../../utils/format';
import {
  FILTER_KEYS,
  SORTS,
  activeTags,
  countInstitutes,
  groupByCareer,
  groupByDegree,
  readFilters,
  readVue,
} from './catalogue';
import Filters from './Filters';
import Hero from './Hero';

/* Accueil et recherche — route / (ticket P2).
   Maquette : template/index.html. */

// Place le début des résultats en haut de l'écran (sans animation si l'utilisateur l'a demandée).
function scrollToResults() {
  const top = document.getElementById('resultats');
  if (!top) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: top.offsetTop - 80, behavior: calm ? 'auto' : 'smooth' });
}

function Accueil() {
  const [params, setParams] = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  const vue = readVue(params);
  const filters = readFilters(params);
  const sort = params.get('sort') ?? '';

  // Listes de référence : domaines, arrondissements, diplômes, débouchés, séries du bac.
  const domains = useFetch('/domains').data ?? [];
  const districts = useFetch('/districts').data ?? [];
  const degrees = useFetch('/degrees').data ?? [];
  const careers = useFetch('/careers').data ?? [];
  const series = useFetch('/bac-series').data ?? [];
  const everyInstitute = useFetch('/institutes').data;

  // Les instituts ont leur propre liste ; les trois autres vues viennent des formations trouvées.
  // Les vues « Diplômes » et « Débouchés » ignorent leur propre filtre pour lister tous les choix possibles.
  const institutes = useFetch(vue === 'inst' ? '/institutes' : null, filters);
  const programs = useFetch(vue === 'inst' ? null : '/programs', {
    ...filters,
    degree_id: vue === 'dip' ? undefined : filters.degree_id,
    career_id: vue === 'deb' ? undefined : filters.career_id,
    sort: vue === 'form' ? sort : undefined,
  });
  const current = vue === 'inst' ? institutes : programs;

  // Le panneau de filtres plein écran (téléphone) bloque le défilement de la page derrière lui.
  useEffect(() => {
    document.body.style.overflow = panelOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [panelOpen]);

  // Applique des changements aux filtres ; une valeur vide retire le filtre.
  function change(patch) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === null || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace: true });
  }

  // Efface les filtres et la recherche, mais garde le domaine, la vue et le tri.
  function clearFilters() {
    change(Object.fromEntries(FILTER_KEYS.filter((key) => key !== 'domain_id').map((key) => [key, null])));
  }

  function goTo(patch) {
    change(patch);
    scrollToResults();
  }

  const domain = domains.find((d) => d.id === filters.domain_id);
  const inDomain = domain ? ` en ${domain.name}` : '';
  const tags = activeTags(filters, { degrees, careers, series });
  const activeCount = tags.filter((tag) => tag.key !== 'q').length;

  const totals = {
    inst: everyInstitute ? everyInstitute.total : null,
    form: degrees.length ? degrees.reduce((sum, d) => sum + d.program_count, 0) : null,
    dip: degrees.length || null,
    deb: careers.length || null,
  };

  // Titre de la barre de résultats et grille, selon la vue ; `count` sert à détecter l'absence de résultat.
  function showResults(items) {
    if (vue === 'inst') {
      return {
        count: items.length,
        label: `${plural(items.length, 'institut')}${inDomain} à Brazzaville`,
        grid: items.map((institute) => <InstitutCard key={institute.id} institute={institute} />),
      };
    }
    if (vue === 'form') {
      return {
        count: items.length,
        label: `${plural(items.length, 'formation')}${inDomain} à Brazzaville`,
        grid: items.map((program) => <FormationCard key={program.id} program={program} />),
      };
    }

    const dip = vue === 'dip';
    const groups = dip ? groupByDegree(items) : groupByCareer(items, careers);
    return {
      count: groups.length,
      label: dip
        ? `${plural(groups.length, 'diplôme')} préparé${groups.length > 1 ? 's' : ''} à Brazzaville`
        : `${plural(groups.length, 'débouché')}${inDomain}`,
      choices: groups.map((group) => (
        <button
          className="job"
          type="button"
          key={group.id}
          onClick={() => goTo({ vue: 'form', [dip ? 'degree_id' : 'career_id']: group.id })}
        >
          <Icon name={dip ? 'award' : 'brief'} />
          <span>
            {group.name}
            <small>
              {dip ? `${formatDuration(group.duration)} · ` : ''}
              {plural(group.programs.length, 'formation')} · {plural(countInstitutes(group.programs), 'institut')}
            </small>
          </span>
        </button>
      )),
    };
  }

  let label = 'Chargement…';
  let content = <Status loading />;

  if (current.error) {
    content = <Status error={current.error} onRetry={current.reload} />;
  } else if (current.data) {
    const result = showResults(current.data.items);
    label = result.label;
    if (result.count === 0) {
      content = (
        <div className="grid">
          <div className="empty">
            <h3>Résultat introuvable</h3>
            <p>Vérifie l'orthographe ou retire un filtre pour voir plus de résultats.</p>
            <button className="btn line" type="button" onClick={clearFilters}>
              Effacer tous les filtres
            </button>
          </div>
        </div>
      );
    } else {
      content = result.grid ? <div className="grid">{result.grid}</div> : <div className="jobgrid">{result.choices}</div>;
    }
  }

  return (
    <>
      <Hero
        filters={filters}
        vue={vue}
        districts={districts}
        degrees={degrees}
        totals={totals}
        onSearch={(search) => goTo(search)}
        onVue={(next) => goTo({ vue: next })}
      />

      <nav className="cats" aria-label="Domaines">
        <div className="wrap">
          <button className="cat" type="button" aria-pressed={!filters.domain_id} onClick={() => change({ domain_id: null })}>
            <Icon name="all" />
            Tout
          </button>
          {domains.map((d) => (
            <button
              className="cat"
              type="button"
              key={d.id}
              aria-pressed={filters.domain_id === d.id}
              onClick={() => change({ domain_id: d.id })}
            >
              <Icon name={d.id} />
              {d.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="wrap layout" id="resultats">
        <aside className={`filters${panelOpen ? ' open' : ''}`} aria-label="Filtres">
          <Filters
            filters={filters}
            lists={{ districts, degrees, careers, series }}
            onChange={change}
            onClear={clearFilters}
            onClose={() => setPanelOpen(false)}
          />
        </aside>

        <div>
          <div className="rbar">
            <h2>{label}</h2>
            <div className="r">
              <button className="openf" type="button" onClick={() => setPanelOpen(true)}>
                <Icon name="sliders" />
                Filtres {activeCount > 0 && <span>({activeCount})</span>}
              </button>
              {vue === 'form' && (
                <select
                  className="sort"
                  aria-label="Trier les formations"
                  value={sort || 'relevance'}
                  onChange={(e) => change({ sort: e.target.value === 'relevance' ? null : e.target.value })}
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="active-tags">
              {tags.map((tag) => (
                <button className="atag" type="button" key={tag.key} onClick={() => change({ [tag.key]: null })}>
                  {tag.label}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}

          {content}
        </div>
      </div>

      {panelOpen && <div className="scrim" onClick={() => setPanelOpen(false)} />}
    </>
  );
}

export default Accueil;
