import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstitutes, getPrograms } from '../../api/catalogue';
import Icon from '../../components/Icon';
import { useSearch } from '../../context/search-context';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formationPath, institutPath } from '../../routes';
import { normalize, pluriel } from '../../utils/format';
import { districtLabel } from './filters';

const NONE = { institutes: [], programs: [] };

// Suggestions : les premiers instituts et formations que l'API trouve pour ce mot.
async function loadSuggestions(word) {
  if (!word) return NONE;
  const [institutes, programs] = await Promise.all([getInstitutes({ q: word }), getPrograms({ q: word })]);
  return { institutes: institutes.slice(0, 3), programs: programs.slice(0, 5) };
}

// Barre de recherche de l'accueil : mot-clé, arrondissement, diplôme (EX-01, EX-02).
// - Le bouton « Rechercher » (ou Entrée) lance la recherche : la grille est
//   rechargée depuis l'API avec le mot tapé.
// - Pendant la frappe, seules des suggestions apparaissent. Elles sont demandées
//   à l'API après une pause de 0,4 s et à partir de 2 lettres, pour ne pas
//   l'appeler à chaque touche.
export default function SearchBar({ data, onSearch }) {
  const { filters, change } = useSearch();
  const navigate = useNavigate();
  const [text, setText] = useState(filters.q);
  const [open, setOpen] = useState(false);

  const typed = useDebounce(text.trim(), 400);
  // Liste fermée (recherche lancée, champ quitté) : on ne demande rien.
  const word = open && typed.length >= 2 ? typed : '';
  const suggestions = useApi(() => loadSuggestions(word), [word]);
  const { institutes, programs } = suggestions.data ?? NONE;
  // Les débouchés viennent de la liste de référence, déjà chargée.
  const careers = word
    ? data.careers.filter((career) => normalize(career.name).includes(normalize(word))).slice(0, 5)
    : [];
  const hasSuggestions = institutes.length + careers.length + programs.length > 0;

  const onSubmit = (event) => {
    event.preventDefault();
    setOpen(false);
    change({ q: text.trim() });
    onSearch();
  };

  const pickCareer = (career) => {
    setOpen(false);
    change({ q: '', careers: [career.id], view: 'form' });
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
                  <small>
                    {institute.district}, {institute.city}
                  </small>
                </span>
              </button>
            ))}
            {careers.length > 0 && <h4>Débouchés</h4>}
            {careers.map((career) => (
              <button key={career.id} type="button" onClick={() => pickCareer(career)}>
                <span className="ic">
                  <Icon name="brief" />
                </span>
                <span>
                  {career.name}
                  <small>{pluriel(career.program_count, 'formation')}</small>
                </span>
              </button>
            ))}
            {programs.length > 0 && <h4>Formations</h4>}
            {programs.map((program) => (
              <button key={program.id} type="button" onClick={() => navigate(formationPath(program.id))}>
                <span className="ic">
                  <Icon name={program.domain.icon} />
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
          <option value="">Tous</option>
          {data.districts.map((item) => (
            <option key={item.id} value={item.id}>
              {districtLabel(item, data.districts)}
            </option>
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
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
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
