// Configurations des quatre pages de référentiel (tickets P20 à P23). Chaque page ne
// fournit que ces réglages : la page générique (Referentiel.jsx) s'occupe de la liste,
// du formulaire et de la suppression. Champs de DegreeInput, CareerInput,
// BacSeriesInput et DomainInput dans docs/openapi.yaml.
// Maquette : template/back-office.html (pageRefl).

import { plural } from '../../utils/format';

export const DIPLOMES = {
  cle: 'name',
  etiquette: 'Intitulé',
  ph: 'ex. Licence',
  liste: '/degrees',
  gestion: '/admin/degrees',
  titre: 'Diplômes',
  intro:
    "Référentiel des diplômes délivrés, avec leur durée d'études : il alimente les formations et la recherche publique.",
  nom: 'diplôme',
  un: 'un diplôme',
  le: 'le diplôme',
  ce: 'ce diplôme',
  aucun: 'Aucun diplôme',
  affiche: (item) => item.name,
  initial: () => ({ name: '', duration: '2' }),
  toValues: (item) => ({ name: item.name, duration: String(item.duration) }),
  toPayload: (values) => ({ name: values.name.trim(), duration: Number(values.duration) }),
  validate: (values) =>
    values.name.trim() ? {} : { name: "L'intitulé du diplôme est obligatoire." },
  champTitre: "Durée des études",
  champ: (values, errors, set) => (
    <div className="fld">
      <label htmlFor="r-duration">Durée des études</label>
      <select id="r-duration" value={values.duration} onChange={set('duration')}>
        {[1, 2, 3, 4, 5].map((duree) => (
          <option key={duree} value={duree}>
            {duree} an{duree > 1 ? 's' : ''}
          </option>
        ))}
      </select>
      <span className="hint">S'applique à toutes les formations qui délivrent ce diplôme.</span>
    </div>
  ),
  ligne: (item) => `${item.duration} an${item.duration > 1 ? 's' : ''}`,
  usage: (item) => item.program_count ?? 0,
};

export const DEBOUCHES = {
  cle: 'name',
  etiquette: 'Intitulé',
  ph: 'ex. Comptable',
  liste: '/admin/careers',
  gestion: '/admin/careers',
  titre: 'Débouchés',
  intro: 'Référentiel des débouchés professionnels, rattachés aux formations.',
  nom: 'débouché',
  un: 'un débouché',
  le: 'le débouché',
  ce: 'ce débouché',
  aucun: 'Aucun débouché',
  affiche: (item) => item.name,
  initial: () => ({ name: '', domain_id: '' }),
  toValues: (item) => ({ name: item.name, domain_id: item.domain_id }),
  toPayload: (values) => ({ name: values.name.trim(), domain_id: values.domain_id }),
  validate: (values) => {
    const errors = {};
    if (!values.name.trim()) errors.name = "L'intitulé du débouché est obligatoire.";
    if (!values.domain_id) errors.domain_id = "Choisissez le domaine d'insertion.";
    return errors;
  },
  champTitre: "Domaine d'insertion",
  champ: (values, errors, set, extra) => (
    <div className={`fld${errors.domain_id ? ' bad' : ''}`}>
      <label htmlFor="r-domain">Domaine d'insertion</label>
      <select id="r-domain" value={values.domain_id} onChange={set('domain_id')}>
        <option value="">Choisir…</option>
        {(extra?.domaines ?? []).map((domaine) => (
          <option key={domaine.id} value={domaine.id}>
            {domaine.name}
          </option>
        ))}
      </select>
      {errors.domain_id && (
        <span className="err" id="r-domain-err">
          {errors.domain_id}
        </span>
      )}
    </div>
  ),
  ligne: (item, extra) =>
    extra?.domaines?.find((domaine) => domaine.id === item.domain_id)?.name ?? '—',
  usage: (item) => item.program_count ?? 0,
};

export const SERIES = {
  cle: 'code',
  etiquette: 'Série',
  ph: 'ex. A',
  liste: '/bac-series',
  gestion: '/admin/bac-series',
  titre: 'Séries du bac',
  intro:
    "Référentiel des séries du baccalauréat. Elles se rattachent aux formations comme conditions d'admission et servent de filtre sur le site public.",
  nom: 'série',
  un: 'une série',
  le: 'la série',
  ce: 'cette série',
  aucun: 'Aucune série',
  affiche: (item) => `Série ${item.code}`,
  initial: () => ({ code: '', label: '' }),
  toValues: (item) => ({ code: item.code, label: item.label ?? '' }),
  toPayload: (values) => ({
    code: values.code.trim().toUpperCase(),
    label: values.label.trim() || null,
  }),
  validate: (values) =>
    values.code.trim() ? {} : { code: 'Le code de la série est obligatoire.' },
  champTitre: 'Libellé',
  champ: (values, errors, set) => (
    <div className="fld">
      <label htmlFor="r-label">Libellé</label>
      <input id="r-label" value={values.label} onChange={set('label')} placeholder="ex. Lettres" />
      <span className="hint">Les séries se rattachent ensuite aux formations, dans leur fiche.</span>
    </div>
  ),
  ligne: (item) => item.label ?? '—',
  usage: (item, extra) =>
    (extra?.programs ?? []).filter((program) => program.bac_series.includes(item.code)).length,
};

export const DOMAINES = {
  cle: 'name',
  etiquette: 'Intitulé',
  ph: 'ex. Informatique',
  liste: '/domains',
  gestion: '/admin/domains',
  titre: "Domaines d'insertion",
  intro:
    "Référentiel des domaines d'insertion : ils classent les formations et les débouchés, et forment la barre de catégories du site public.",
  nom: 'domaine',
  un: 'un domaine',
  le: 'le domaine',
  ce: 'ce domaine',
  aucun: 'Aucun domaine',
  affiche: (item) => item.name,
  initial: () => ({ name: '', color: '#1E6B4A' }),
  toValues: (item) => ({ name: item.name, color: item.color }),
  toPayload: (values) => ({ name: values.name.trim(), color: values.color }),
  validate: (values) => {
    const errors = {};
    if (!values.name.trim()) errors.name = "L'intitulé du domaine est obligatoire.";
    if (!/^#[0-9A-Fa-f]{6}$/.test(values.color)) {
      errors.color = 'Saisissez une couleur au format hexadécimal (#RRGGBB).';
    }
    return errors;
  },
  champTitre: 'Couleur',
  champ: (values, errors, set) => (
    <div className={`fld${errors.color ? ' bad' : ''}`}>
      <label htmlFor="r-color">Couleur</label>
      <input id="r-color" type="color" value={values.color} onChange={set('color')} />
      <span className="hint">Couleur des vignettes des formations de ce domaine.</span>
      {errors.color && (
        <span className="err" id="r-color-err">
          {errors.color}
        </span>
      )}
    </div>
  ),
  ligne: (item, extra) => (
    <div className="who">
      <span>
        <span
          style={{
            display: 'inline-block',
            width: 22,
            height: 22,
            borderRadius: 6,
            verticalAlign: 'middle',
            background: item.color,
          }}
          aria-hidden="true"
        />
        {' '}
        <small>
          {plural((extra?.careers ?? []).filter((career) => career.domain_id === item.id).length, 'débouché')}
        </small>
      </span>
    </div>
  ),
  usage: (item, extra) =>
    (extra?.programs ?? []).filter((program) => program.domain.id === item.id).length,
};