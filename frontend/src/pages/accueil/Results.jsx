import { getProgram } from '../../api/catalogue';
import Icon from '../../components/Icon';
import InstituteCard from '../../components/InstituteCard';
import LoadError from '../../components/LoadError';
import MiniCard from '../../components/MiniCard';
import ProgramCard from '../../components/ProgramCard';
import SkeletonCards from '../../components/SkeletonCards';
import { useSearch } from '../../context/search-context';
import { useApi } from '../../hooks/useApi';
import { ans, fcfa, pluriel } from '../../utils/format';
import { popularIds, recentIds } from '../../utils/history';
import { MAX_BUDGET, activeCount } from './filters';

// Formations déjà consultées par le visiteur, relues dans l'API par leur
// identifiant. Une formation supprimée depuis est simplement ignorée.
async function loadVisited() {
  const ids = [...new Set([...recentIds().slice(0, 4), ...popularIds().slice(0, 4)])];
  const programs = await Promise.all(ids.map((id) => getProgram(id).catch(() => null)));
  return programs.filter(Boolean);
}

// Colonne de résultats de l'accueil : compteur, tri, rappels de filtres, grille.
// La grille change selon la vue choisie : instituts, formations, diplômes ou débouchés.
// found est la liste renvoyée par l'API pour cette vue, déjà cherchée et filtrée :
// des instituts dans la vue Instituts, des formations dans les autres.
// Pendant le chargement, la grille affiche des cartes fantômes ; en cas d'échec,
// un message avec un bouton pour réessayer.
export default function Results({ data, found, loading, searching, error, onRetry, onOpenFilters }) {
  const { filters, change, resetFilters } = useSearch();
  const { view } = filters;
  const domain = data.domains.find((item) => item.id === filters.domain);
  const inDomain = domain ? ` en ${domain.name}` : '';
  const visited = useApi(loadVisited, []).data ?? [];

  let label;
  let content = null;

  if (view === 'inst') {
    // program_count et degrees ne comptent que les formations qui correspondent aux filtres.
    label = `${pluriel(found.length, 'institut')}${inDomain} à Brazzaville`;
    content = found.map((institute) => (
      <InstituteCard
        key={institute.id}
        institute={institute}
        programCount={institute.program_count}
        degrees={institute.degrees}
      />
    ));
  } else if (view === 'form') {
    label = `${pluriel(found.length, 'formation')}${inDomain} à Brazzaville`;
    content = found.map((program) => <ProgramCard key={program.id} program={program} />);
  } else {
    // Vues Diplômes et Débouchés : les formations trouvées sont regroupées en
    // tuiles, une par diplôme ou par débouché. Un clic ouvre ses formations.
    const isDegree = view === 'dip';
    const key = isDegree ? 'degrees' : 'careers';
    const list = isDegree ? data.degrees : data.careers;
    const tiles = list
      .map((item) => ({
        id: item.id,
        name: item.name,
        programs: found.filter((program) =>
          isDegree ? program.degree.id === item.id : program.careers.includes(item.name),
        ),
      }))
      .filter((tile) => tile.programs.length > 0);
    label = isDegree
      ? `${pluriel(tiles.length, 'diplôme')} préparé${tiles.length > 1 ? 's' : ''} à Brazzaville`
      : `${pluriel(tiles.length, 'débouché')}${inDomain}`;
    if (tiles.length > 0) {
      content = (
        <div className="jobgrid" style={{ gridColumn: '1/-1' }}>
          {tiles.map((tile) => (
            <button
              className="job"
              type="button"
              key={tile.id}
              onClick={() => change({ [key]: [tile.id], view: 'form' })}
            >
              <Icon name={isDegree ? 'award' : 'brief'} />
              <span>
                {tile.name}
                <small>
                  {isDegree ? `${ans(tile.programs[0].duration)} · ` : ''}
                  {pluriel(tile.programs.length, 'formation')} ·{' '}
                  {pluriel(new Set(tile.programs.map((program) => program.institute.id)).size, 'institut')}
                </small>
              </span>
            </button>
          ))}
        </div>
      );
    }
  }
  const empty = Array.isArray(content) ? content.length === 0 : !content;

  // Rappels des filtres actifs : un clic retire le filtre.
  const tags = [];
  if (filters.q) tags.push({ text: `« ${filters.q} »`, remove: { q: '' } });
  // Débouchés et diplômes sont gardés par identifiant : leur nom vient des listes de référence.
  for (const id of filters.careers) {
    const career = data.careers.find((item) => item.id === id);
    if (career) tags.push({ text: career.name, remove: { careers: filters.careers.filter((item) => item !== id) } });
  }
  for (const id of filters.degrees) {
    const degree = data.degrees.find((item) => item.id === id);
    if (degree) tags.push({ text: degree.name, remove: { degrees: filters.degrees.filter((item) => item !== id) } });
  }
  for (const value of filters.districts) {
    tags.push({ text: value, remove: { districts: filters.districts.filter((item) => item !== value) } });
  }
  for (const value of filters.durations) {
    tags.push({ text: ans(value), remove: { durations: filters.durations.filter((item) => item !== value) } });
  }
  if (filters.budget < MAX_BUDGET) tags.push({ text: `≤ ${fcfa(filters.budget)}`, remove: { budget: MAX_BUDGET } });
  if (filters.series) tags.push({ text: `Série ${filters.series}`, remove: { series: '' } });
  if (filters.evening) tags.push({ text: 'Cours du soir', remove: { evening: false } });
  if (filters.internship) tags.push({ text: 'Stage inclus', remove: { internship: false } });
  if (filters.installments) tags.push({ text: 'Paiement en tranches', remove: { installments: false } });

  const byId = (id) => visited.find((program) => program.id === id);
  const recent = recentIds().map(byId).filter(Boolean).slice(0, 4);
  const popular = popularIds().map(byId).filter(Boolean).slice(0, 4);
  const miniDetail = (program) =>
    `${program.degree.name} · ${program.institute.short_name} · ${fcfa(program.tuition)}/an`;
  const active = activeCount(filters);

  return (
    <div style={{ minWidth: 0 }}>
      <div className="rbar">
        <h2>{loading ? 'Chargement…' : error ? 'Données indisponibles' : label}</h2>
        <div className="r">
          <button className="openf" type="button" onClick={onOpenFilters}>
            <Icon name="sliders" />
            Filtres <span>{active > 0 ? `(${active})` : ''}</span>
          </button>
          {view === 'form' && (
            <select
              className="sort"
              aria-label="Trier"
              value={filters.sort}
              onChange={(event) => change({ sort: event.target.value })}
            >
              <option value="relevance">Trier : pertinence</option>
              <option value="tuition_asc">Prix croissant</option>
              <option value="tuition_desc">Prix décroissant</option>
              <option value="duration">Durée la plus courte</option>
            </select>
          )}
        </div>
      </div>

      <div className="active-tags">
        {tags.map((tag) => (
          <button className="atag" type="button" key={tag.text} onClick={() => change(tag.remove)}>
            {tag.text}
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>

      <div className="grid" aria-busy={loading || searching}>
        {loading ? (
          <SkeletonCards />
        ) : error ? (
          <LoadError error={error} onRetry={onRetry} />
        ) : empty ? (
          // EX-13 : recherche vide ou mal saisie.
          <div className="empty">
            <h3>Résultat introuvable</h3>
            <p>Vérifie l'orthographe ou retire un filtre pour voir plus de résultats.</p>
            <button className="btn line" type="button" onClick={resetFilters}>
              Effacer tous les filtres
            </button>
          </div>
        ) : (
          content
        )}
      </div>

      {recent.length > 0 && (
        <div className="sec">
          <h2>Consultées récemment</h2>
          <div className="minigrid" style={{ marginTop: 6 }}>
            {recent.map((program) => (
              <MiniCard key={program.id} program={program} detail={miniDetail(program)} />
            ))}
          </div>
        </div>
      )}
      {popular.length > 0 && (
        <div className="sec">
          <h2>Formations les plus visitées</h2>
          <div className="minigrid" style={{ marginTop: 6 }}>
            {popular.map((program) => (
              <MiniCard key={program.id} program={program} detail={miniDetail(program)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
