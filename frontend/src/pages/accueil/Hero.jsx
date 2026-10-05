import { VUES } from './catalogue';
import Icon from '../../components/Icon';

const ACCES = {
  inst: { icon: 'building', label: 'Instituts' },
  form: { icon: 'cap', label: 'Formations' },
  dip: { icon: 'award', label: 'Diplômes' },
  deb: { icon: 'brief', label: 'Débouchés' },
};

// Bandeau d'accueil : recherche « institut, filière ou diplôme » et quatre accès (instituts, formations,
// diplômes, débouchés). Le formulaire est « non contrôlé » : on lit ses champs à l'envoi, et la page
// le recrée (key) quand les filtres changent ailleurs, par exemple avec « Tout effacer ».
export default function Hero({ filters, vue, districts, degrees, totals, onSearch, onVue }) {
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSearch({
      q: form.get('q').trim(),
      district: form.get('district'),
      degree_id: form.get('degree_id'),
    });
  }

  return (
    <section className="hero">
      <div className="wrap">
        <h1>Trouve ton institut à Brazzaville</h1>
        <p>Instituts privés, formations, diplômes et débouchés : tout au même endroit, sans te déplacer.</p>

        <form
          className="search"
          role="search"
          autoComplete="off"
          onSubmit={submit}
          key={`${filters.q ?? ''}|${filters.district ?? ''}|${filters.degree_id ?? ''}`}
        >
          <div className="sf q">
            <label htmlFor="s-q">Institut, filière ou diplôme</label>
            <input id="s-q" name="q" placeholder="ex. ISGF, comptabilité, BTS" defaultValue={filters.q ?? ''} />
          </div>
          <div className="sf">
            <label htmlFor="s-district">Arrondissement</label>
            <select id="s-district" name="district" defaultValue={filters.district ?? ''}>
              <option value="">Tout Brazzaville</option>
              {districts.map((district) => (
                <option key={district.name}>{district.name}</option>
              ))}
            </select>
          </div>
          <div className="sf dip">
            <label htmlFor="s-degree">Diplôme</label>
            <select id="s-degree" name="degree_id" defaultValue={filters.degree_id ?? ''}>
              <option value="">Tous</option>
              {degrees.map((degree) => (
                <option key={degree.id} value={degree.id}>
                  {degree.name}
                </option>
              ))}
            </select>
          </div>
          <button className="go" type="submit">
            <Icon name="search" />
            <span>Rechercher</span>
          </button>
        </form>

        <div className="access" role="group" aria-label="Parcourir">
          {VUES.map((key) => (
            <button className="acc" type="button" key={key} aria-pressed={vue === key} onClick={() => onVue(key)}>
              <Icon name={ACCES[key].icon} />
              <span>
                <b>{ACCES[key].label}</b>
                <small>{totals[key] === null ? '\u00a0' : `${totals[key]} à Brazzaville`}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
