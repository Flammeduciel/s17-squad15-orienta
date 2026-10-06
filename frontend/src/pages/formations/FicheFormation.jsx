import { Link, useParams } from 'react-router-dom';
import AgrementBadge from '../../components/AgrementBadge';
import BackLink from '../../components/BackLink';
import Icon from '../../components/Icon';
import PageIntrouvable from '../../components/PageIntrouvable';
import Status from '../../components/Status';
import { useFavoris } from '../../context/favoris-context';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { formatDate, formatDuration, formatFcfa } from '../../utils/format';
import { admissionText, feeLines } from '../../utils/program';
import FormulaireQuestion from './FormulaireQuestion';

/* Fiche formation — route /formations/:id (ticket P4).
   Maquette : template/index.html. */

// Dossier d'inscription : le dossier de base, celui d'un Master, et le complément santé.
const DOSSIER = [
  "Copie du baccalauréat ou de l'attestation de réussite",
  'Relevé de notes du bac',
  "Acte de naissance",
  "2 photos d'identité",
];
const DOSSIER_MASTER = [
  'Copie de la Licence et relevés de notes',
  'Curriculum vitae',
  'Lettre de motivation',
  "2 photos d'identité",
];

function FicheFormation() {
  const { id } = useParams();
  const { isFavori, toggle } = useFavoris();

  const { data: program, loading, error, reload } = useFetch(`/programs/${id}`);
  // Les coordonnées (téléphone, WhatsApp) et les autres formations viennent de la fiche institut :
  // ProgramDetail n'embarque que le résumé de l'institut.
  const { data: institute } = useFetch(
    program ? `/institutes/${program.institute.id}` : null,
  );
  const careers = useFetch('/careers').data ?? [];
  // Formations de même domaine, ailleurs qu'à cet institut (« Formations similaires »).
  const similar = useFetch(program ? '/programs' : null, { domain_id: program.domain.id }).data?.items ?? [];

  if (error?.status === 404 || error?.status === 400 || program?.status === 'draft') {
    return <PageIntrouvable title="Formation introuvable" message="Cette formation n'existe pas ou n'existe plus." />;
  }
  if (error || !program) {
    return (
      <div className="wrap detail">
        <BackLink />
        <Status loading={loading} error={error} onRetry={reload} />
      </div>
    );
  }

  const favori = isFavori(program.id);
  const careerId = (name) => careers.find((career) => career.name === name)?.id;
  const autres = (institute?.programs ?? []).filter((p) => p.id !== program.id);
  const similaires = similar
    .filter((p) => p.institute.id !== program.institute.id)
    .slice(0, 3);
  const dossier = program.degree.name === 'Master' ? DOSSIER_MASTER : DOSSIER;

  const whatsappMessage = `Bonjour ${program.institute.short_name}, je suis bachelier(ère) et je m'intéresse à la formation « ${program.name} ». Pouvez-vous me donner plus d'informations (admission, frais, places disponibles) ?`;
  const subject = encodeURIComponent(`Demande d'informations — ${program.name}`);
  const total = formatFcfa(program.tuition + (institute?.registration_fee ?? program.institute.registration_fee));

  return (
    <div className="wrap detail">
      <BackLink />

      <div className="dtitle">
        <div>
          <h1>{program.name}</h1>
          <p className="sub">
            <b>{program.degree.name}</b> · {formatDuration(program.duration)} ·{' '}
            <Link className="ilnk" to={ROUTES.institut(program.institute.id)}>
              {program.institute.name}
            </Link>{' '}
            · {program.institute.district}
          </p>
        </div>
        <button
          className="btn line"
          type="button"
          aria-pressed={favori}
          aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={() => toggle(program.id)}
        >
          <Icon name="heart" />
          {favori ? 'Dans vos favoris' : 'Ajouter aux favoris'}
        </button>
      </div>

      <div className="dcover" style={{ background: program.domain.color }}>
        <Icon name={program.domain.id} className="big" />
      </div>

      <div className="dgrid">
        <div className="dmain sec">
          {program.description && (
            <section>
              <h2>Présentation</h2>
              <p>{program.description}</p>
            </section>
          )}

          <section className="highlights">
            <div className="hl">
              <Icon name="cap" />
              <div>
                <b>
                  {program.degree.name} en {formatDuration(program.duration)}
                </b>
                <span>{admissionText(program)}</span>
              </div>
            </div>
            <div className="hl">
              <Icon name="brief" />
              <div>
                <b>
                  {program.internship_months > 0
                    ? `Stage de ${program.internship_months} mois en entreprise`
                    : "Projet de fin d'études"}
                </b>
                <span>
                  {program.internship_months > 0
                    ? "Organisé par l'institut en dernière année"
                    : 'Réalisé avec un encadrant de l’institut'}
                </span>
              </div>
            </div>
            <div className="hl">
              <Icon name={program.evening ? 'moon' : 'clock'} />
              <div>
                <b>{program.evening ? 'Cours du jour ou du soir' : 'Cours en journée'}</b>
                <span>{program.evening ? 'Tu peux étudier tout en travaillant' : 'Du lundi au vendredi'}</span>
              </div>
            </div>
            <div className="hl">
              <Icon name="cash" />
              <div>
                <b>{program.installments ? 'Paiement en plusieurs fois' : "Paiement à l'inscription"}</b>
                <span>
                  {program.installments ? 'Scolarité réglable en plusieurs tranches' : 'Scolarité réglée en une fois'}
                </span>
              </div>
            </div>
          </section>

          {program.careers.length > 0 && (
            <section>
              <h2>Les débouchés après cette formation</h2>
              <div className="jobgrid">
                {program.careers.map((name) =>
                  careerId(name) ? (
                    <Link className="job" key={name} to={ROUTES.debouche(careerId(name))}>
                      <Icon name="brief" />
                      {name}
                    </Link>
                  ) : (
                    <span className="job" key={name}>
                      <Icon name="brief" />
                      {name}
                    </span>
                  ),
                )}
              </div>
              <p>Touche un débouché pour voir toutes les formations qui y mènent.</p>
            </section>
          )}

          <section>
            <h2>Ce que tu vas apprendre</h2>
            {program.years.length > 0 ? (
              <div className="years">
                {program.years.map((annee) => (
                  <div className="year" key={annee.year}>
                    <h3>{annee.label}</h3>
                    <ul>
                      {annee.courses.map((course) => (
                        <li key={course}>{course}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p>Le programme de cette formation n'a pas encore été renseigné.</p>
            )}
          </section>

          <section>
            <h2>Dossier d'inscription</h2>
            <ul className="checklist">
              {dossier.map((piece) => (
                <li key={piece}>{piece}</li>
              ))}
              {program.domain.id === 'sante' && <li>Certificat médical et carnet de vaccination</li>}
            </ul>
          </section>

          <section>
            <h2>L'institut</h2>
            <div className="instbox">
              <div className="instlogo" style={{ background: program.institute.color ?? '#5E6B64' }}>
                {program.institute.short_name}
              </div>
              <div>
                <b>
                  <Link className="ilnk" to={ROUTES.institut(program.institute.id)}>
                    {program.institute.name}
                  </Link>
                </b>
                <div>
                  <AgrementBadge institute={program.institute} />
                </div>
                <p>
                  <Icon name="pin" />
                  {institute?.address ? `${institute.address}, Brazzaville` : `${program.institute.district}, Brazzaville`}
                </p>
              </div>
            </div>
            {institute?.description && <p>{institute.description}</p>}

            {autres.length > 0 && (
              <>
                <h3>Autres formations de {program.institute.short_name}</h3>
                <div className="minigrid">
                  {autres.map((other) => (
                    <Link className="mini" key={other.id} to={ROUTES.formation(other.id)}>
                      <b>{other.name}</b>
                      <small>
                        {other.degree.name} · {formatDuration(other.duration)} · {formatFcfa(other.tuition)}/an
                      </small>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          {similaires.length > 0 && (
            <section>
              <h2>Formations similaires ailleurs</h2>
              <div className="minigrid">
                {similaires.map((other) => (
                  <Link className="mini" key={other.id} to={ROUTES.formation(other.id)}>
                    <b>{other.name}</b>
                    <small>
                      {other.institute.short_name} · {other.institute.district} · {formatFcfa(other.tuition)}/an
                    </small>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="book">
          <p className="p">
            <b className="num">{formatFcfa(program.tuition)}</b> / an
          </p>

          <AgrementBadge institute={program.institute} />

          {(institute?.registration_deadline || institute?.start_date) && (
            <div className="dates">
              {institute?.registration_deadline && (
                <div>
                  <small>Inscriptions jusqu'au</small>
                  {formatDate(institute.registration_deadline)}
                </div>
              )}
              {institute?.start_date && (
                <div>
                  <small>Rentrée</small>
                  {formatDate(institute.start_date)}
                </div>
              )}
            </div>
          )}

          <div className="lines">
            {feeLines(program).map((line) => (
              <div key={line.label || 'frais'}>
                <span>{line.label ? `Scolarité ${line.label}` : 'Scolarité'}</span>
                <span className="num">{formatFcfa(line.amount)}</span>
              </div>
            ))}
            <div>
              <span>Frais d'inscription</span>
              <span className="num">{formatFcfa(institute?.registration_fee ?? program.institute.registration_fee)}</span>
            </div>
            <div className="tot">
              <span>Total à prévoir</span>
              <span className="num">{total}</span>
            </div>
          </div>

          {institute?.whatsapp && (
            <a
              className="btn wa"
              href={`https://wa.me/${institute.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp — message pré-rempli
            </a>
          )}

          {institute?.phone && (
            <div className="phone">
              <div>
                <small>Secrétariat</small>
                <span>{institute.phone}</span>
              </div>
              <button
                className="copy"
                type="button"
                title="Copier le numéro"
                aria-label="Copier le numéro de téléphone"
                onClick={() => navigator.clipboard?.writeText(institute.phone)}
              >
                Copier
              </button>
            </div>
          )}

          {institute?.email && (
            <a className="btn line" href={`mailto:${institute.email}?subject=${subject}`}>
              Écrire par e-mail
            </a>
          )}

          <FormulaireQuestion
            institut={{ name: program.institute.name, short_name: program.institute.short_name }}
            formation={{ id: program.id, name: program.name }}
          />
        </aside>
      </div>
    </div>
  );
}

export default FicheFormation;