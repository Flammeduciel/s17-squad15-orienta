import { useState } from 'react';
import { useSearch } from '../../context/search-context';
import { ans, fcfa, normalize } from '../../utils/format';
import { MAX_BUDGET, MIN_BUDGET, programsWith, toggleIn } from './filters';

// Panneau de filtres de l'accueil. Sur mobile, il s'ouvre en feuille par le bas.
export default function FilterPanel({ data, open, onClose }) {
  const { filters, change, resetFilters } = useSearch();
  const [careerSearch, setCareerSearch] = useState('');

  // Nombre de formations qu'on obtiendrait en choisissant cette seule valeur.
  const count = (key, value) => programsWith(data.programs, filters, key, value).length;

  const careers = data.careers.filter((name) => normalize(name).includes(normalize(careerSearch)));
  const durations = [...new Set(data.degrees.map((degree) => degree.duration))].sort((a, b) => a - b);

  return (
    <aside className={`filters${open ? ' open' : ''}`} aria-label="Filtres">
      <div className="fhead">
        <h2>Filtres</h2>
        <button className="clear" type="button" onClick={resetFilters}>
          Tout effacer
        </button>
      </div>

      <div className="fgroup">
        <h3>Arrondissement</h3>
        {data.districts.map((name) => (
          <label className="check" key={name}>
            <input
              type="checkbox"
              checked={filters.districts.includes(name)}
              onChange={() => change({ districts: toggleIn(filters.districts, name) })}
            />
            {name}
            <span className="n">{count('districts', name)}</span>
          </label>
        ))}
      </div>

      <div className="fgroup">
        <h3>Débouché visé</h3>
        <p className="hint">Les formations qui mènent à ces débouchés.</p>
        <input
          className="mfind"
          placeholder="Chercher un débouché"
          value={careerSearch}
          onChange={(event) => setCareerSearch(event.target.value)}
        />
        <div className="mlist">
          {careers.length === 0 && (
            <p className="hint" style={{ margin: 0 }}>
              Aucun débouché trouvé.
            </p>
          )}
          {careers.map((name) => (
            <label className="check" key={name}>
              <input
                type="checkbox"
                checked={filters.careers.includes(name)}
                onChange={() => change({ careers: toggleIn(filters.careers, name) })}
              />
              {name}
              <span className="n">{count('careers', name)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="fgroup">
        <h3>Diplôme préparé</h3>
        <div className="pills">
          {data.degrees.map((degree) => (
            <button
              className="pill"
              type="button"
              key={degree.id}
              aria-pressed={filters.degrees.includes(degree.name)}
              onClick={() => change({ degrees: toggleIn(filters.degrees, degree.name) })}
            >
              {degree.name}
            </button>
          ))}
        </div>
      </div>

      <div className="fgroup">
        <h3>Durée des études</h3>
        <div className="pills">
          {durations.map((duration) => (
            <button
              className="pill"
              type="button"
              key={duration}
              aria-pressed={filters.durations.includes(duration)}
              onClick={() => change({ durations: toggleIn(filters.durations, duration) })}
            >
              {ans(duration)}
            </button>
          ))}
        </div>
      </div>

      <div className="fgroup">
        <h3>Budget par an</h3>
        <input
          className="range"
          type="range"
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step="10000"
          value={filters.budget}
          aria-label="Budget maximum par an"
          onChange={(event) => change({ budget: Number(event.target.value) })}
        />
        <div className="rangeval">
          <span>Jusqu'à</span>
          <b>{filters.budget >= MAX_BUDGET ? 'Sans limite' : fcfa(filters.budget)}</b>
        </div>
      </div>

      <div className="fgroup">
        <h3>Ma série du bac</h3>
        <select
          className="plain"
          aria-label="Série du bac"
          value={filters.series}
          onChange={(event) => change({ series: event.target.value })}
        >
          <option value="">Toutes les séries</option>
          {data.bacSeries.map((series) => (
            <option key={series.id} value={series.code}>
              Série {series.code}
              {series.label ? ` (${series.label})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="fgroup" style={{ borderBottom: 0 }}>
        <h3>Organisation</h3>
        <label className="toggle">
          <span>
            Cours du soir<small>Pour étudier en travaillant</small>
          </span>
          <input
            className="sw"
            type="checkbox"
            checked={filters.evening}
            onChange={(event) => change({ evening: event.target.checked })}
          />
        </label>
        <label className="toggle">
          <span>
            Stage en entreprise<small>Inclus dans la formation</small>
          </span>
          <input
            className="sw"
            type="checkbox"
            checked={filters.internship}
            onChange={(event) => change({ internship: event.target.checked })}
          />
        </label>
        <label className="toggle">
          <span>
            Paiement en plusieurs fois<small>Frais réglables par tranches</small>
          </span>
          <input
            className="sw"
            type="checkbox"
            checked={filters.installments}
            onChange={(event) => change({ installments: event.target.checked })}
          />
        </label>
      </div>

      <div className="sheet-foot">
        <button className="clear" type="button" onClick={resetFilters}>
          Tout effacer
        </button>
        <button className="btn" type="button" onClick={onClose}>
          Voir les résultats
        </button>
      </div>
    </aside>
  );
}
