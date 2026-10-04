import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useSearch } from '../../context/search-context';
import { formationPath, institutPath } from '../../routes';
import { normalize } from '../../utils/format';

// Barre de recherche de l'accueil : mot-clé, arrondissement, diplôme (EX-01, EX-02).
// En tapant, des suggestions apparaissent : instituts, débouchés, formations.
export default function SearchBar({ data, onSearch }) {
  const { filters, change } = useSearch();
  const navigate = useNavigate();
  const [text, setText] = useState(filters.q);
  const [open, setOpen] = useState(false);

  const word = normalize(text.trim());
  const institutes = word
    ? data.institutes
        .filter((i) => normalize(i.name).includes(word) || normalize(i.short_name).includes(word))
        .slice(0, 3)
    : [];
  const careers = word ? data.careers.filter((name) => normalize(name).includes(word)).slice(0, 5) : [];
  const programs = word
    ? data.programs
        .filter((p) => normalize(p.name).includes(word) || normalize(p.domain.name).includes(word))
        .slice(0, 5)
    : [];
  const hasSuggestions = institutes.length + careers.length + programs.length > 0;

  const onSubmit = (event) => {
    event.preventDefault();
    change({ q: text.trim() });
    setOpen(false);
    onSearch();
  };

  const pickCareer = (name) => {
    setText('');
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
          value={text}
          onChange={(event) => {
            setText(event.target.value);
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
                  <small>{data.programs.filter((p) => p.careers.includes(name)).length} formation(s)</small>
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
