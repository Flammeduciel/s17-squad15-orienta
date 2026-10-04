import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useSearch } from '../../context/search-context';
import { formationPath, institutPath } from '../../routes';
import { normalize, pluriel } from '../../utils/format';

// Barre de recherche de l'accueil : mot-clé, arrondissement, diplôme (EX-01, EX-02).
// Chaque lettre tapée met à jour le filtre « q » : l'accueil relance alors la
// recherche dans l'API, et la grille comme les suggestions suivent.
// found : formations et instituts renvoyés par l'API pour la recherche en cours.
export default function SearchBar({ data, found, onSearch }) {
  const { filters, change } = useSearch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Suggestions : les premiers résultats de l'API, et les débouchés de ces
  // formations dont le nom contient le mot tapé.
  const word = normalize(filters.q.trim());
  const institutes = word ? found.institutes.slice(0, 3) : [];
  const programs = word ? found.programs.slice(0, 5) : [];
  const careers = word
    ? [...new Set(found.programs.flatMap((program) => program.careers))]
        .filter((name) => normalize(name).includes(word))
        .slice(0, 5)
    : [];
  const hasSuggestions = institutes.length + careers.length + programs.length > 0;

  // Entrée ou « Rechercher » : on ferme les suggestions et on montre la grille.
  const onSubmit = (event) => {
    event.preventDefault();
    change({ q: filters.q.trim() });
    setOpen(false);
    onSearch();
  };

  const pickCareer = (name) => {
    setOpen(false);
    change({ q: '', careers: [name], view: 'form' });
    onSearch();
  };

  // Les deux listes déroulantes reflètent le filtre quand une seule valeur est choisie.
  const district = filters.districts.length === 1 ? filters.districts[0] : '';
  const degree = filters.degrees.length === 1 ? filters.degrees[0] : '';

  return (
    <form className="search" autoComplete="off" role="search" onSubmit={onSubmit}>
      <div className="sf q">
        <label htmlFor="s-q">Institut, filière ou diplôme</label>
        <input
          id="s-q"
          placeholder="ex. ISGF, comptabilité, BTS"
          value={filters.q}
          onChange={(event) => {
            change({ q: event.target.value });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && hasSuggestions && (
          <div className="sugg">
            {institutes.length > 0 && <h4>Instituts</h4>}
            {institutes.map((institute) => (
              <button key={institute.id} type="button" onClick={() => navigate(institutPath(institute.id))}>
                <span className="ic">
                  <Icon name="cap" />
                </span>
                <span>
                  {institute.name}
                  <small>{institute.district}</small>
                </span>
              </button>
            ))}
            {careers.length > 0 && <h4>Débouchés</h4>}
            {careers.map((name) => (
              <button key={name} type="button" onClick={() => pickCareer(name)}>
                <span className="ic">
                  <Icon name="brief" />
                </span>
                <span>
                  {name}
                  <small>{pluriel(found.programs.filter((p) => p.careers.includes(name)).length, 'formation')}</small>
                </span>
              </button>
            ))}
            {programs.length > 0 && <h4>Formations</h4>}
            {programs.map((program) => (
              <button key={program.id} type="button" onClick={() => navigate(formationPath(program.id))}>
                <span className="ic">
                  <Icon name={program.domain.id} />
                </span>
                <span>
                  {program.name}
                  <small>
                    {program.degree.name} · {program.institute.short_name}
                  </small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="sf">
        <label htmlFor="s-arr">Arrondissement</label>
        <select
          id="s-arr"
          value={district}
          onChange={(event) => change({ districts: event.target.value ? [event.target.value] : [] })}
        >
          <option value="">Tout Brazzaville</option>
          {data.districts.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="sf dip">
        <label htmlFor="s-dip">Diplôme</label>
        <select
          id="s-dip"
          value={degree}
          onChange={(event) => change({ degrees: event.target.value ? [event.target.value] : [] })}
        >
          <option value="">Tous</option>
          {data.degrees.map((item) => (
            <option key={item.id}>{item.name}</option>
          ))}
        </select>
      </div>
      <button className="go" type="submit">
        <Icon name="search" />
        <span>Rechercher</span>
      </button>
    </form>
  );
}
