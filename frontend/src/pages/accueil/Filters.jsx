import { useState } from 'react';
import { formatDuration, formatFcfa } from '../../utils/format';
import { MAX_BUDGET, MIN_BUDGET } from './catalogue';

// Pour la recherche dans la liste des débouchés : sans accents ni majuscules.
const plain = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const ORGANISATION = [
  { key: 'evening', label: 'Cours du soir', hint: 'Pour étudier en travaillant' },
  { key: 'internship', label: 'Stage en entreprise', hint: 'Inclus dans la formation' },
  { key: 'installments', label: 'Paiement en plusieurs fois', hint: 'Frais réglables par tranches' },
];

// Panneau de filtres. L'API accepte une seule valeur par critère : cocher une autre case remplace la première.
//   filters  : filtres actifs (voir readFilters) ;  onChange({ clé: valeur }) : null retire le filtre ;
//   lists    : districts, degrees, careers, series (listes de référence) ;
//   onClose  : ferme le panneau sur téléphone.
export default function Filters({ filters, lists, onChange, onClear, onClose }) {
  const [careerSearch, setCareerSearch] = useState('');

  const careers = lists.careers.filter((c) => plain(c.name).includes(plain(careerSearch.trim())));
  const durations = [...new Set(lists.degrees.map((d) => d.duration))].sort((a, b) => a - b);
  const budget = filters.max_tuition ? Number(filters.max_tuition) : MAX_BUDGET;

  // Remet à zéro un critère déjà choisi, sinon le choisit.
  const toggleValue = (key, value) => onChange({ [key]: filters[key] === String(value) ? null : value });

  return (
    <>
      <div className="fhead">
        <h2>Filtres</h2>
        <button className="clear" type="button" onClick={onClear}>
          Tout effacer
        </button>
      </div>

      <div className="fgroup">
        <h3>Arrondissement</h3>
        {lists.districts.map((district) => (
          <label className="check" key={district.name}>
            <input
              type="checkbox"
              checked={filters.district === district.name}
              onChange={() => toggleValue('district', district.name)}
            />
            {district.name}
          </label>
        ))}
      </div>

      <div className="fgroup">
        <h3>Débouché visé</h3>
        <p className="hint">Les formations qui mènent à ce débouché.</p>
        <input
          className="mfind"
          placeholder="Chercher un débouché"
          aria-label="Chercher un débouché"
          value={careerSearch}
          onChange={(e) => setCareerSearch(e.target.value)}
        />
        <div className="mlist">
          {careers.map((career) => (
            <label className="check" key={career.id}>
              <input
                type="checkbox"
                checked={filters.career_id === String(career.id)}
                onChange={() => toggleValue('career_id', career.id)}
              />
              {career.name}
            </label>
          ))}
          {careers.length === 0 && <p className="hint">Aucun débouché trouvé.</p>}
        </div>
      </div>

      <div className="fgroup">
        <h3>Diplôme préparé</h3>
        <div className="pills">
          {lists.degrees.map((degree) => (
            <button
              className="pill"
              type="button"
              key={degree.id}
              aria-pressed={filters.degree_id === String(degree.id)}
              onClick={() => toggleValue('degree_id', degree.id)}
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
              aria-pressed={filters.duration === String(duration)}
              onClick={() => toggleValue('duration', duration)}
            >
              {formatDuration(duration)}
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
          value={budget}
          aria-label="Budget maximum par an"
          onChange={(e) => onChange({ max_tuition: Number(e.target.value) >= MAX_BUDGET ? null : e.target.value })}
        />
        <div className="rangeval">
          <span>Jusqu'à</span>
          <b>{budget >= MAX_BUDGET ? 'Sans limite' : formatFcfa(budget)}</b>
        </div>
      </div>

      <div className="fgroup">
        <h3>Ma série du bac</h3>
        <select
          className="plain"
          aria-label="Série du bac"
          value={filters.bac_series ?? ''}
          onChange={(e) => onChange({ bac_series: e.target.value })}
        >
          <option value="">Toutes les séries</option>
          {lists.series.map((serie) => (
            <option key={serie.id} value={serie.code}>
              Série {serie.code}
              {serie.label ? ` (${serie.label})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="fgroup">
        <h3>Organisation</h3>
        {ORGANISATION.map(({ key, label, hint }) => (
          <label className="toggle" key={key}>
            <span>
              {label}
              <small>{hint}</small>
            </span>
            <input
              className="sw"
              type="checkbox"
              checked={filters[key] === 'true'}
              onChange={(e) => onChange({ [key]: e.target.checked ? 'true' : null })}
            />
          </label>
        ))}
      </div>

      <div className="sheet-foot">
        <button className="clear" type="button" onClick={onClear}>
          Tout effacer
        </button>
        <button className="btn" type="button" onClick={onClose}>
          Voir les résultats
        </button>
      </div>
    </>
  );
}
