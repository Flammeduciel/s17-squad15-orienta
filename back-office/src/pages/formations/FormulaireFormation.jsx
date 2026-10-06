import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { errorMessage, request } from '../../api/http';
import Icon from '../../components/Icon';
import Status from '../../components/Status';
import { useToast } from '../../context/toast-context';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { plural } from '../../utils/format';
import { EMPTY, toPayload, toValues, validate } from './formulaire';

/* Formulaire formation — routes /admin/formations/nouvelle et /admin/formations/:id (ticket P15).
   Maquette : template/back-office.html. */

// Pour comparer des noms : sans accents ni majuscules.
const plain = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// (0) → « 1re année », (1) → « 2e année »… Libellé des lignes de frais et des cours.
const niveau = (index) => `${index === 0 ? '1re' : `${index + 1}e`} année`;

// Champ de formulaire : étiquette, saisie, aide et message d'erreur. Le reste des attributs va à la saisie.
function Field({ id, label, hint, error, as: Input = 'input', ...props }) {
  return (
    <div className={`fld${error ? ' bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {hint && <span className="hint">{hint}</span>}
      {error && (
        <span className="err" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}

function Formulaire({ program, institutes, domains, degrees, series, careers }) {
  const toast = useToast();
  const navigate = useNavigate();
  const editing = Boolean(program);

  const [values, setValues] = useState(() =>
    editing
      ? toValues(program, series, careers)
      : {
          ...EMPTY,
          institute_id: String(institutes[0]?.id ?? ''),
          domain_id: domains[0]?.id ?? '',
          degree_id: String(degrees[0]?.id ?? ''),
          fees: Array.from({ length: degrees[0]?.duration ?? 0 }, () => ''),
        },
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [careerQuery, setCareerQuery] = useState('');

  const degree = degrees.find((item) => item.id === Number(values.degree_id));
  const careerWords = plain(careerQuery).split(/\s+/).filter(Boolean);

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggle = (field) => () => {
    setValues((current) => ({ ...current, [field]: !current[field] }));
  };

  // Une case à cocher d'une liste d'identifiants : série ou débouché.
  const toggleId = (field) => (id) => {
    setValues((current) => {
      const ids = current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id];
      return { ...current, [field]: ids };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  // Le diplôme choisi donne le nombre d'années, donc le nombre de lignes de frais.
  function changeDegree(event) {
    const degreeId = event.target.value;
    const duration = degrees.find((item) => item.id === Number(degreeId))?.duration ?? 0;
    setValues((current) => ({
      ...current,
      degree_id: degreeId,
      fees: Array.from({ length: duration }, (_, index) => current.fees[index] ?? ''),
    }));
    setErrors((current) => ({ ...current, degree_id: undefined, fees: undefined }));
  }

  const setFee = (index) => (event) => {
    setValues((current) => {
      const fees = current.fees.slice();
      fees[index] = event.target.value;
      return { ...current, fees };
    });
    setErrors((current) => ({ ...current, fees: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count > 0) {
      toast(`${plural(count, 'erreur')} dans le formulaire.`, true);
      document.querySelector('.fld.bad')?.scrollIntoView?.({ block: 'center' });
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(values);
      if (editing) {
        await request(`/admin/programs/${program.id}`, { method: 'PUT', body: payload });
        toast('Formation mise à jour.');
        navigate(ROUTES.formations);
      } else {
        const created = await request('/admin/programs', { method: 'POST', body: payload });
        toast('Formation créée. Ajoutez maintenant ses cours.');
        navigate(`${ROUTES.cours}?formation=${created.id}`);
      }
    } catch (error) {
      toast(errorMessage(error), true);
      setSaving(false);
    }
  }

  const careersFiltered = careers.filter((career) =>
    careerWords.every((word) => plain(career.name).includes(word)),
  );

  return (
    <>
      <div className="pagehead">
        <div>
          <Link className="btn ghost sm" to={ROUTES.formations}>
            <Icon name="back" />
            Retour à la liste
          </Link>
          <h1>{editing ? 'Modifier la formation' : 'Ajouter une formation'}</h1>
          <p>
            {editing
              ? 'Les modifications sont reprises par le site public.'
              : "Renseignez l'intitulé, le diplôme visé et l'institut qui porte la formation."}
          </p>
        </div>
      </div>

      <form className="form" noValidate onSubmit={submit}>
        <fieldset>
          <legend>Identification</legend>
          <div className="row two">
            <Field
              id="f-name"
              label="Intitulé de la filière"
              required
              value={values.name}
              onChange={set('name')}
              placeholder="ex. Comptabilité et gestion des entreprises"
              error={errors.name}
            />
            <Field id="f-degree" label="Diplôme délivré" as="select" value={values.degree_id} onChange={changeDegree} error={errors.degree_id}>
              <option value="">Choisir…</option>
              {degrees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.duration} an{item.duration > 1 ? 's' : ''}
                </option>
              ))}
            </Field>
          </div>
          <div className="row two">
            <Field id="f-institute" label="Institut" as="select" value={values.institute_id} onChange={set('institute_id')} error={errors.institute_id}>
              <option value="">Choisir…</option>
              {institutes.map((institut) => (
                <option key={institut.id} value={institut.id}>
                  {institut.short_name} — {institut.name}
                </option>
              ))}
            </Field>
            <Field id="f-domain" label="Domaine" as="select" value={values.domain_id} onChange={set('domain_id')} error={errors.domain_id}>
              <option value="">Choisir…</option>
              {domains.map((domaine) => (
                <option key={domaine.id} value={domaine.id}>
                  {domaine.name}
                </option>
              ))}
            </Field>
          </div>
          <div className="row">
            <Field
              id="f-description"
              label="Description"
              as="textarea"
              value={values.description}
              onChange={set('description')}
              placeholder="Présentation courte de la formation, affichée sur sa fiche publique"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Niveaux et tarifs</legend>
          <div className="row two">
            <div className="fld">
              <label>Durée des études</label>
              <p>
                {values.degree_id
                  ? `${degree?.duration ?? 0} an${degree?.duration > 1 ? 's' : ''} (${degree?.name ?? ''})`
                  : "Choisissez d'abord le diplôme."}
              </p>
              <span className="hint">Définie par le diplôme délivré.</span>
            </div>
            <Field
              id="f-stage"
              label="Stage (mois)"
              type="number"
              min="0"
              max="12"
              value={values.internship_months}
              onChange={set('internship_months')}
              hint="0 signifie qu'aucun stage n'est prévu."
              error={errors.internship_months}
            />
          </div>
          <div className="row">
            <div className={`fld${errors.fees ? ' bad' : ''}`}>
              <label>Frais par niveau (FCFA par an)</label>
              <div className="tarifs">
                {values.fees.length > 0 ? (
                  values.fees.map((montant, index) => (
                    <label key={index}>
                      {niveau(index)}
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={montant}
                        onChange={setFee(index)}
                        aria-label={`Frais ${niveau(index)}`}
                      />
                    </label>
                  ))
                ) : (
                  <span className="hint">Choisissez un diplôme pour fixer les frais par niveau.</span>
                )}
              </div>
              {errors.fees && (
                <span className="err" role="alert">
                  {errors.fees}
                </span>
              )}
            </div>
          </div>
          <div className="row">
            <div className="fld">
              <label>Options</label>
              <label className="check">
                <input type="checkbox" checked={values.evening} onChange={toggle('evening')} />
                Cours du soir
              </label>
              <label className="check">
                <input type="checkbox" checked={values.installments} onChange={toggle('installments')} />
                Paiement en plusieurs fois
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Conditions d'admission</legend>
          <div className="row two">
            <div className="fld">
              <label>Séries du bac acceptées</label>
              <div className="sergrid">
                {series.length > 0 ? (
                  series.map((serie) => (
                    <label className="check" key={serie.id}>
                      <input
                        type="checkbox"
                        checked={values.series_ids.includes(serie.id)}
                        onChange={() => toggleId('series_ids')(serie.id)}
                      />
                      Série {serie.code}
                      {serie.label ? ` — ${serie.label}` : ''}
                    </label>
                  ))
                ) : (
                  <span className="hint">Aucune série au référentiel.</span>
                )}
              </div>
              <span className="hint">
                Aucune case cochée : la série n'est pas un critère d'admission.{' '}
                <Link to={ROUTES.series}>Gérer les séries</Link>
              </span>
            </div>
            <Field
              id="f-admission"
              label="Autres conditions"
              value={values.admission_requirements}
              onChange={set('admission_requirements')}
              placeholder="ex. Étude de dossier et entretien"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Contenu</legend>
          <div className="row">
            <div className={`fld${errors.career_ids ? ' bad' : ''}`}>
              <label htmlFor="deb-find">Débouchés</label>
              <input
                id="deb-find"
                type="search"
                placeholder="Filtrer les débouchés"
                value={careerQuery}
                onChange={(event) => setCareerQuery(event.target.value)}
              />
              <div className="deblist">
                {careersFiltered.length > 0 ? (
                  careersFiltered.map((career) => (
                    <label className="check" key={career.id}>
                      <input
                        type="checkbox"
                        checked={values.career_ids.includes(career.id)}
                        onChange={() => toggleId('career_ids')(career.id)}
                      />
                      {career.name}
                    </label>
                  ))
                ) : (
                  <span className="hint">
                    {careers.length === 0 ? 'Aucun débouché au référentiel.' : 'Aucun débouché ne correspond à ce filtre.'}
                  </span>
                )}
              </div>
              <span className="hint">
                Au moins un débouché est obligatoire. <Link to={ROUTES.debouches}>Gérer les débouchés</Link>
              </span>
              {errors.career_ids && (
                <span className="err" role="alert">
                  {errors.career_ids}
                </span>
              )}
            </div>
          </div>
          <div className="row">
            <div className="fld">
              <label>Programme</label>
              {editing ? (
                <>
                  <div className="programme">
                    {program.years.map((annee) => (
                      <div className="annee" key={annee.year}>
                        <b>{annee.label}</b>
                        {annee.courses.length > 0 ? (
                          <ul>
                            {annee.courses.map((cours) => (
                              <li key={cours}>{cours}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="hint">Aucun cours.</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="hint">
                    <Link to={`${ROUTES.cours}?formation=${program.id}`}>Gérer les cours de cette formation</Link>
                  </span>
                </>
              ) : (
                <span className="hint">
                  Créez d'abord la formation : ses cours s'ajoutent ensuite dans la rubrique Cours, année par année.
                </span>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Publication</legend>
          <Field id="f-status" label="Statut" as="select" value={values.status} onChange={set('status')}>
            <option value="published">Publiée — visible sur le site public</option>
            <option value="draft">Brouillon — invisible du public</option>
          </Field>
        </fieldset>

        <div className="formfoot">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Créer la formation'}
          </button>
          <Link className="btn line" to={ROUTES.formations}>
            Annuler
          </Link>
          <span className="sp">
            {editing ? `Identifiant : ${program.id}` : "L'identifiant sera généré automatiquement."}
          </span>
        </div>
      </form>
    </>
  );
}

function FormulaireFormation() {
  const { id } = useParams();
  const editing = id !== undefined;
  // Une adresse qui n'est pas un identifiant (/admin/formations/abc) ne mène à aucune formation.
  const validId = !editing || /^[1-9]\d*$/.test(id);

  const program = useFetch(editing && validId ? `/admin/programs/${id}` : null);
  const institutes = useFetch('/institutes');
  const domains = useFetch('/domains');
  const degrees = useFetch('/degrees');
  const series = useFetch('/bac-series');
  const careers = useFetch('/admin/careers');

  if (!validId || program.error?.status === 404) {
    return (
      <div className="empty">
        <h3>Formation introuvable</h3>
        <p>Cette formation n'existe pas ou a été supprimée.</p>
        <Link className="btn line" to={ROUTES.formations}>
          Retour à la liste
        </Link>
      </div>
    );
  }

  const failed = [program, institutes, domains, degrees, series, careers].find((source) => source.error);
  if (failed) return <Status error={failed.error} onRetry={failed.reload} />;
  if (!institutes.data || !domains.data || !degrees.data || !series.data || !careers.data || (editing && !program.data)) {
    return <Status loading />;
  }

  return (
    <Formulaire
      key={id ?? 'nouveau'}
      program={program.data}
      institutes={institutes.data.items}
      domains={domains.data}
      degrees={degrees.data}
      series={series.data}
      careers={careers.data}
    />
  );
}

export default FormulaireFormation;