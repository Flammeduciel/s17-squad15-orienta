/* Fiche formation — route /formations/:id (ticket P4).
   Maquette : template/index.html. */
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCareers, getInstitute, getProgram, getPrograms } from '../../api/catalogue';
import AccreditationBadge from '../../components/AccreditationBadge';
import CareerButtons from '../../components/CareerButtons';
import Icon from '../../components/Icon';
import MiniCard from '../../components/MiniCard';
import PageState from '../../components/PageState';
import { useFavorites } from '../../context/favorites-context';
import { useApi } from '../../hooks/useApi';
import { ROUTES, institutPath } from '../../routes';
import { admission, ans, dateFr, fcfa, mailLink, whatsappLink } from '../../utils/format';
import { trackVisit } from '../../utils/history';
import FormulaireQuestion from './FormulaireQuestion';

// Pièces du dossier d'inscription, selon le niveau d'entrée.
const DOSSIER_BAC = [
  "Copie du baccalauréat ou de l'attestation de réussite",
  'Relevé de notes du bac',
  'Acte de naissance',
  "2 photos d'identité",
];
const DOSSIER_MASTER = [
  'Copie de la Licence et relevés de notes',
  'Curriculum vitae',
  'Lettre de motivation',
  "2 photos d'identité",
];

// La fiche a besoin de la formation, de son institut (coordonnées, dates),
// des autres formations (pour les suggestions) et du référentiel des débouchés.
async function loadFiche(id) {
  const program = await getProgram(id);
  const [institute, programs, careers] = await Promise.all([
    getInstitute(program.institute.id),
    getPrograms(),
    getCareers(),
  ]);
  return { program, institute, programs, careers };
}

function FicheFormation() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(() => loadFiche(id), [id]);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!data) return;
    document.title = `${data.program.name} · Orienta`;
    // Alimente « Consultées récemment » et « Les plus visitées » de l'accueil.
    trackVisit(data.program.id);
  }, [data]);

  if (!data) return <PageState loading={loading} error={error} notFound="Formation introuvable" onRetry={reload} />;

  const { program, institute, programs, careers } = data;
  const { domain } = program;
  const favorite = isFavorite(program.id);
  const others = institute.programs.filter((item) => item.id !== program.id);
  const similar = programs
    .filter((item) => item.domain.id === domain.id && item.institute.id !== institute.id)
    .slice(0, 3);
  const master = program.degree.name === 'Master';
  const stage = program.internship_months;
  const waMessage = `Bonjour ${institute.short_name}, je suis bachelier(ère) et je m'intéresse à la formation « ${program.name} ». Pouvez-vous me donner plus d'informations (admission, frais, places disponibles) ?`;

  return (
    <>
      <div className="wrap detail">
        <Link className="back" to={ROUTES.accueil}>
          <Icon name="back" size={18} />
          Retour aux résultats
        </Link>

        <div className="dtitle">
          <div>
            <h1>{program.name}</h1>
            <p className="sub">
              <b>{program.degree.name}</b> · {ans(program.duration)} ·{' '}
              <Link className="ilnk" to={institutPath(institute.id)}>
                {institute.name}
              </Link>{' '}
              · {institute.district}
            </p>
          </div>
          <button
            className="lnk"
            type="button"
            aria-pressed={favorite}
            style={{ textDecoration: 'underline' }}
            onClick={() => toggleFavorite(program.id)}
          >
            {favorite ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'}
          </button>
        </div>

        <div className="dcover" style={{ background: domain.color }}>
          <div style={{ width: '100%', height: '100%' }}>
            <div className="cover" style={{ background: 'none', aspectRatio: 'auto', height: '100%' }}>
              <div className="pat" />
              <div className="blob" />
              <Icon name={domain.icon} className="big" />
              <span className="inst">{institute.short_name}</span>
            </div>
          </div>
        </div>

        <div className="dgrid">
          <div className="dmain">
            {program.description && (
              <section>
                <h2>Présentation</h2>
                <p style={{ maxWidth: '70ch' }}>{program.description}</p>
              </section>
            )}

            <section className="highlights">
              <div className="hl">
                <Icon name="cap" />
                <div>
                  <b>
                    {program.degree.name} en {ans(program.duration)}
                  </b>
                  <span>{admission(program)}</span>
                </div>
              </div>
              <div className="hl">
                <Icon name="brief" />
                <div>
                  <b>{stage ? `Stage de ${stage} mois en entreprise` : "Projet de fin d'études"}</b>
                  <span>
                    {stage ? "Organisé par l'institut en dernière année" : "Réalisé avec un encadrant de l'institut"}
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
                    {program.installments
                      ? 'Scolarité réglable en plusieurs tranches'
                      : 'Scolarité réglée en une fois'}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2>Les débouchés après cette formation</h2>
              <CareerButtons names={program.careers} careers={careers} />
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 10 }}>
                Touche un débouché pour voir toutes les formations qui y mènent.
              </p>
            </section>

            {program.years.length > 0 && (
              <section>
                <h2>Ce que tu vas apprendre</h2>
                <div className="years">
                  {program.years.map((year, index) => (
                    <div className="year" key={year.year}>
                      <h3>{year.label}</h3>
                      <ul>
                        {year.courses.map((course) => (
                          <li key={course}>{course}</li>
                        ))}
                        {/* Le stage se fait en dernière année. */}
                        {stage > 0 && index === program.years.length - 1 && (
                          <li>Stage en entreprise ({stage} mois)</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2>Dossier d'inscription</h2>
              <ul className="checklist">
                {(master ? DOSSIER_MASTER : DOSSIER_BAC).map((piece) => (
                  <li key={piece}>{piece}</li>
                ))}
                {domain.id === 'sante' && <li>Certificat médical et carnet de vaccination</li>}
              </ul>
            </section>

            <section>
              <h2>L'institut</h2>
              <div className="instbox">
                <div className="instlogo" style={{ background: institute.color }}>
                  {institute.short_name}
                </div>
                <div>
                  <b style={{ fontSize: 18 }}>
                    <Link className="ilnk" to={institutPath(institute.id)}>
                      {institute.name}
                    </Link>
                  </b>
                  <div style={{ marginTop: 6 }}>
                    <AccreditationBadge institute={institute} />
                  </div>
                  <p style={{ marginTop: 6 }}>
                    <Icon name="pin" size={14} /> {institute.address}, Brazzaville
                  </p>
                </div>
              </div>
              <p style={{ marginTop: 14, maxWidth: '64ch' }}>{institute.description}</p>
              {others.length > 0 && (
                <>
                  <h3 style={{ marginTop: 24, fontSize: 16 }}>Autres formations de {institute.short_name}</h3>
                  <div className="minigrid">
                    {others.map((item) => (
                      <MiniCard
                        key={item.id}
                        program={item}
                        detail={`${item.degree.name} · ${ans(item.duration)} · ${fcfa(item.tuition)}/an`}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            {similar.length > 0 && (
              <section style={{ borderBottom: 0 }}>
                <h2>Formations similaires ailleurs</h2>
                <div className="minigrid">
                  {similar.map((item) => (
                    <MiniCard
                      key={item.id}
                      program={item}
                      detail={`${item.institute.short_name} · ${item.institute.district} · ${fcfa(item.tuition)}/an`}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="book" id="book">
            <p className="p">
              <b className="num">{fcfa(program.tuition)}</b> / an
            </p>
            <AccreditationBadge institute={institute} />
            <div className="dates">
              <div>
                <small>Inscriptions jusqu'au</small>
                {dateFr(institute.registration_deadline)}
              </div>
              <div>
                <small>Rentrée</small>
                {dateFr(institute.start_date)}
              </div>
            </div>
            <div className="lines">
              <div>
                <span>Scolarité 1re année</span>
                <span className="num">{fcfa(program.tuition)}</span>
              </div>
              <div>
                <span>Frais d'inscription</span>
                <span className="num">{fcfa(institute.registration_fee)}</span>
              </div>
              <div className="tot">
                <span>Total à prévoir</span>
                <span className="num">{fcfa(program.tuition + institute.registration_fee)}</span>
              </div>
            </div>
            <a className="btn wa" href={whatsappLink(institute, waMessage)} target="_blank" rel="noopener">
              WhatsApp — message pré-rempli
            </a>
            <div className="phone">
              <div>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Secrétariat</small>
                <span>{institute.phone}</span>
              </div>
              <a className="copy" href={`tel:${institute.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
                Appeler
              </a>
            </div>
            {institute.email && (
              <a className="btn line" href={mailLink(institute, `Demande d'informations — ${program.name}`)}>
                Écrire par e-mail
              </a>
            )}
            <FormulaireQuestion program={program} institute={institute} />
          </aside>
        </div>
      </div>

      {/* Barre fixe en bas d'écran sur mobile. */}
      <div className="mbar">
        <div>
          <b className="num">{fcfa(program.tuition)}</b> / an
          <small>Rentrée {dateFr(institute.start_date)}</small>
        </div>
        <a className="btn" href="#book">
          Contacter
        </a>
      </div>
    </>
  );
}

export default FicheFormation
