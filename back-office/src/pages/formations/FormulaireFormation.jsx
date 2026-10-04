/* Formulaire formation — routes /admin/formations/nouvelle et /admin/formations/:id (ticket P15).
   Maquette : template/back-office.html. */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createProgram,
  getBacSeries,
  getCareers,
  getDegrees,
  getDomains,
  getInstitutes,
  getProgram,
  getPrograms,
  updateProgram,
} from '../../api/catalogue';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import { useToast } from '../../context/toast-context';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { ans, errorMessage, matches, niveau } from '../../utils/format';

const linkStyle = { color: 'var(--green)', fontWeight: 700 };
const DEFAULT_FEE = 400000;

// Valeurs de départ du formulaire. L'API renvoie les débouchés et les séries
// par leur nom : on retrouve leurs identifiants dans les référentiels.
function toForm(program, lists) {
  if (!program) {
    return {
      name: '',
      degree_id: lists.degrees[0]?.id ?? '',
      institute_id: lists.institutes[0]?.id ?? '',
      domain_id: lists.domains[0]?.id ?? '',
      description: '',
      internship_months: 0,
      fees: [],
      evening: false,
      installments: false,
      bac_series_ids: [],
      admission_requirements: '',
      career_ids: [],
      status: 'published',
    };
  }
  return {
    name: program.name,
    degree_id: program.degree.id,
    institute_id: program.institute.id,
    domain_id: program.domain.id,
    description: program.description ?? '',
    internship_months: program.internship_months,
    fees: program.fees.map((fee) => String(fee.amount)),
    evening: program.evening,
    installments: program.installments,
    bac_series_ids: lists.bacSeries.filter((series) => program.bac_series.includes(series.code)).map((series) => series.id),
    admission_requirements: program.admission_requirements ?? '',
    career_ids: lists.careers.filter((career) => program.careers.includes(career.name)).map((career) => career.id),
    status: program.status,
  };
}

// Une liste de montants de la bonne longueur : on garde ceux déjà saisis, et une
// année ajoutée reprend le montant de la précédente.
function resizeFees(fees, duration) {
  const next = fees.slice(0, duration);
  while (next.length < duration) {
    next.push(next.length ? next[next.length - 1] : String(DEFAULT_FEE));
  }
  return next;
}

// Ajoute l'identifiant à la liste s'il n'y est pas, l'enlève sinon.
const toggle = (list, id) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

function ProgramForm({ program, lists }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const initial = toForm(program, lists);
    const degree = lists.degrees.find((item) => item.id === initial.degree_id);
    return { ...initial, fees: resizeFees(initial.fees, degree?.duration ?? 1) };
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [careerSearch, setCareerSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // La durée des études vient du diplôme choisi : elle n'est pas saisie.
  const degree = lists.degrees.find((item) => item.id === Number(form.degree_id));
  const duration = degree?.duration ?? 1;
  const instituteCount = lists.programs.filter((item) => item.institute.id === Number(form.institute_id)).length;
  const careers = lists.careers.filter((career) => matches(careerSearch, career.name));

  const onChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // Changer de diplôme change le nombre d'années, donc le nombre de montants.
  const onDegree = (event) => {
    const next = lists.degrees.find((item) => item.id === Number(event.target.value));
    setForm({ ...form, degree_id: next.id, fees: resizeFees(form.fees, next.duration) });
  };

  const onFee = (index, value) => {
    const fees = [...form.fees];
    fees[index] = value;
    setForm({ ...form, fees });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    const found = {};
    if (!form.name.trim()) found.name = "L'intitulé est obligatoire.";
    if (form.fees.some((fee) => !(Number(fee) > 0))) found.fees = 'Indiquez les frais de chaque niveau.';
    if (form.career_ids.length === 0) found.careers = 'Cochez au moins un débouché.';
    setErrors(found);
    const count = Object.keys(found).length;
    if (count > 0) {
      toast(`${count} erreur${count > 1 ? 's' : ''} dans le formulaire.`, true);
      return;
    }
    const body = {
      name: form.name.trim(),
      institute_id: Number(form.institute_id),
      domain_id: form.domain_id,
      degree_id: Number(form.degree_id),
      description: form.description.trim() || null,
      admission_requirements: form.admission_requirements.trim() || null,
      fees: form.fees.map(Number),
      bac_series_ids: form.bac_series_ids,
      career_ids: form.career_ids,
      evening: form.evening,
      internship_months: Number(form.internship_months) || 0,
      installments: form.installments,
      status: form.status,
    };
    setSubmitting(true);
    try {
      if (program) {
        await updateProgram(program.id, body);
        toast('Formation mise à jour.');
        navigate(ROUTES.formations);
      } else {
        // Une formation neuve n'a pas encore de programme : on enchaîne sur ses cours.
        const created = await createProgram(body);
        toast('Formation ajoutée. Ajoutez maintenant ses cours.');
        navigate(`${ROUTES.cours}?formation=${created.id}&ajout=1`);
      }
    } catch (err) {
      setApiError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="pagehead">
        <div>
          <Link className="btn ghost sm" to={ROUTES.formations}>
            <Icon name="back" />
            Retour à la liste
          </Link>
          <h1 style={{ marginTop: 10 }}>{program ? 'Modifier la formation' : 'Ajouter une formation'}</h1>
          <p>
            {program
              ? 'Les modifications sont reprises par le site public.'
              : "Renseignez l'intitulé, le diplôme visé et l'institut qui porte la formation."}
          </p>
        </div>
      </div>

      <form className="form" onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend>Identification</legend>
          <div className="row two">
            <div className={`fld${errors.name ? ' bad' : ''}`}>
              <label htmlFor="f-nom">Intitulé de la filière</label>
              <input
                id="f-nom"
                name="name"
                placeholder="ex. Comptabilité et gestion des entreprises"
                value={form.name}
                onChange={onChange}
              />
              {errors.name && <span className="err">{errors.name}</span>}
            </div>
            <div className="fld">
              <label htmlFor="f-dip">Diplôme délivré</label>
              <select id="f-dip" value={form.degree_id} onChange={onDegree}>
                {lists.degrees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {ans(item.duration)}
                  </option>
                ))}
              </select>
              <span className="hint">
                <Link to={ROUTES.diplomes} style={linkStyle}>
                  Gérer les diplômes
                </Link>
              </span>
            </div>
          </div>
          <div className="row two">
            <div className="fld">
              <label htmlFor="f-inst">Institut</label>
              <select id="f-inst" name="institute_id" value={form.institute_id} onChange={onChange}>
                {lists.institutes.map((institute) => (
                  <option key={institute.id} value={institute.id}>
                    {institute.short_name} — {institute.name}
                  </option>
                ))}
              </select>
              <span className="hint">
                {instituteCount} formation{instituteCount > 1 ? 's' : ''} déjà rattachée{instituteCount > 1 ? 's' : ''} à
                cet institut.
              </span>
            </div>
            <div className="fld">
              <label htmlFor="f-dom">Domaine</label>
              <select id="f-dom" name="domain_id" value={form.domain_id} onChange={onChange}>
                {lists.domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="fld">
              <label htmlFor="f-desc">Description</label>
              <textarea
                id="f-desc"
                name="description"
                placeholder="Présentation courte de la formation, affichée sur sa fiche publique"
                value={form.description}
                onChange={onChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Niveaux et tarifs</legend>
          <div className="row two">
            <div className="fld">
              <label>Durée des études</label>
              <p style={{ fontWeight: 700, padding: '11px 0' }}>{ans(duration)}</p>
              <span className="hint">Définie par le diplôme délivré.</span>
            </div>
            <div className="fld">
              <label htmlFor="f-stage">Stage (mois)</label>
              <input
                id="f-stage"
                name="internship_months"
                type="number"
                min="0"
                max="12"
                value={form.internship_months}
                onChange={onChange}
              />
              <span className="hint">0 signifie qu'aucun stage n'est prévu.</span>
            </div>
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <div className={`fld${errors.fees ? ' bad' : ''}`}>
              <label>Frais par niveau (FCFA par an)</label>
              <div className="tarifs">
                {form.fees.map((fee, index) => (
                  <label key={index}>
                    {niveau(index + 1)}
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      aria-label={`Frais ${niveau(index + 1)}`}
                      value={fee}
                      onChange={(event) => onFee(index, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              {errors.fees && <span className="err">{errors.fees}</span>}
            </div>
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <div className="fld">
              <label>Options</label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.evening}
                  onChange={(event) => setForm({ ...form, evening: event.target.checked })}
                />
                Cours du soir
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.installments}
                  onChange={(event) => setForm({ ...form, installments: event.target.checked })}
                />
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
                {lists.bacSeries.length === 0 && <span className="hint">Aucune série au référentiel.</span>}
                {lists.bacSeries.map((series) => (
                  <label className="check" key={series.id}>
                    <input
                      type="checkbox"
                      checked={form.bac_series_ids.includes(series.id)}
                      onChange={() => setForm({ ...form, bac_series_ids: toggle(form.bac_series_ids, series.id) })}
                    />
                    Série {series.code}
                    {series.label ? ` — ${series.label}` : ''}
                  </label>
                ))}
              </div>
              <span className="hint">
                Aucune case cochée : la série n'est pas un critère d'admission.{' '}
                <Link to={ROUTES.series} style={linkStyle}>
                  Gérer les séries
                </Link>
              </span>
            </div>
            <div className="fld">
              <label htmlFor="f-admission">Autres conditions</label>
              <input
                id="f-admission"
                name="admission_requirements"
                placeholder="ex. Étude de dossier et entretien"
                value={form.admission_requirements}
                onChange={onChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contenu</legend>
          <div className="row">
            <div className={`fld${errors.careers ? ' bad' : ''}`}>
              <label htmlFor="deb-find">Débouchés</label>
              <input
                id="deb-find"
                type="search"
                placeholder="Filtrer les débouchés"
                value={careerSearch}
                onChange={(event) => setCareerSearch(event.target.value)}
              />
              <div className="deblist">
                {lists.careers.length === 0 && <span className="hint">Aucun débouché au référentiel.</span>}
                {careers.map((career) => (
                  <label className="check" key={career.id}>
                    <input
                      type="checkbox"
                      checked={form.career_ids.includes(career.id)}
                      onChange={() => setForm({ ...form, career_ids: toggle(form.career_ids, career.id) })}
                    />
                    {career.name}
                  </label>
                ))}
              </div>
              <span className="hint">
                <Link to={ROUTES.debouches} style={linkStyle}>
                  Gérer les débouchés
                </Link>
              </span>
              {errors.careers && <span className="err">{errors.careers}</span>}
            </div>
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <div className="fld">
              <label>Programme</label>
              {program ? (
                <>
                  <div className="programme">
                    {Array.from({ length: duration }, (_, index) => {
                      const year = program.years.find((item) => item.year === index + 1);
                      return (
                        <div className="annee" key={index}>
                          <b>{niveau(index + 1)}</b>
                          {year ? (
                            <ul>
                              {year.courses.map((course) => (
                                <li key={course}>{course}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="hint" style={{ display: 'block' }}>
                              Aucun cours.
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="hint">
                    <Link to={`${ROUTES.cours}?formation=${program.id}`} style={linkStyle}>
                      Gérer les cours de cette formation
                    </Link>
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
          <div className="fld">
            <label htmlFor="f-statut">Statut</label>
            <select id="f-statut" name="status" value={form.status} onChange={onChange}>
              <option value="published">Publiée — visible sur le site public</option>
              <option value="draft">Brouillon — invisible du public</option>
            </select>
          </div>
        </fieldset>

        {apiError && (
          <div className="err" role="alert">
            {apiError}
          </div>
        )}

        <div className="formfoot">
          <button className="btn" type="submit" disabled={submitting}>
            {program ? 'Enregistrer les modifications' : 'Créer la formation'}
          </button>
          <Link className="btn line" to={ROUTES.formations}>
            Annuler
          </Link>
        </div>
      </form>
    </>
  );
}

// La page charge d'abord les référentiels et la formation, puis affiche le
// formulaire : celui-ci peut ainsi partir directement des bonnes valeurs.
function FormulaireFormation() {
  const { id } = useParams();
  const { data, loading, error } = useApi(async () => {
    const [degrees, domains, bacSeries, careers, institutes, programs, program] = await Promise.all([
      getDegrees(),
      getDomains(),
      getBacSeries(),
      getCareers(),
      getInstitutes(),
      getPrograms(),
      id ? getProgram(id) : null,
    ]);
    return { lists: { degrees, domains, bacSeries, careers, institutes, programs }, program };
  }, [id]);

  if (!data || loading) return <PageState loading={loading} error={error} />;
  if (data.lists.institutes.length === 0 || data.lists.degrees.length === 0) {
    return (
      <div className="empty">
        <h3>Il manque un institut ou un diplôme</h3>
        <p>Une formation appartient à un institut et délivre un diplôme : créez-les d'abord.</p>
        <Link className="btn line" to={ROUTES.instituts}>
          Voir les instituts
        </Link>
      </div>
    );
  }
  return <ProgramForm key={id ?? 'nouvelle'} program={data.program} lists={data.lists} />;
}

export default FormulaireFormation
