import { Link, useParams } from 'react-router-dom';
import { imageUrl } from '../../api/http';
import AgrementBadge from '../../components/AgrementBadge';
import BackLink from '../../components/BackLink';
import FormationCard from '../../components/FormationCard';
import Icon from '../../components/Icon';
import PageIntrouvable from '../../components/PageIntrouvable';
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { formatDate, formatDuration, formatFcfa } from '../../utils/format';
import { admissionText, feeLines } from '../../utils/program';

/* Fiche institut — route /instituts/:id (ticket P6).
   Maquette : template/index.html. */

// L'image remplit la couverture ; sans image, c'est le sigle de l'institut sur sa couleur.
const IMAGE_STYLE = { width: '100%', height: '100%', objectFit: 'cover' };

function FicheInstitut() {
  const { id } = useParams();
  const { data: institute, loading, error, reload } = useFetch(`/institutes/${id}`);
  const careerList = useFetch('/careers').data ?? [];

  // Une adresse qui n'est pas un identifiant d'institut, ou un institut supprimé : fiche introuvable.
  if (error?.status === 404 || error?.status === 400) {
    return <PageIntrouvable title="Institut introuvable" message="Cet institut n'existe pas ou n'existe plus." />;
  }
  if (error || !institute) {
    return (
      <div className="wrap detail">
        <BackLink />
        <Status loading={loading} error={error} onRetry={reload} />
      </div>
    );
  }

  const { programs } = institute;
  const image = imageUrl(institute.image_url);
  const careers = [...new Set(programs.flatMap((program) => program.careers))].sort((a, b) => a.localeCompare(b, 'fr'));
  const careerId = (name) => careerList.find((career) => career.name === name)?.id;

  const whatsappMessage = `Bonjour ${institute.short_name}, je souhaite obtenir des informations sur vos formations.`;
  const subject = encodeURIComponent("Demande d'informations");

  return (
    <div className="wrap detail">
      <BackLink />

      <div className="dtitle">
        <div>
          <h1>{institute.name}</h1>
          <p className="sub">
            <b>{institute.short_name}</b> · {institute.district}, Brazzaville
            <AgrementBadge institute={institute} />
          </p>
        </div>
      </div>

      <div className="dcover" style={{ background: institute.color }}>
        {image ? <img src={image} alt="" style={IMAGE_STYLE} /> : <span className="big-sigle">{institute.short_name}</span>}
      </div>

      <div className="dmain sec">
        {institute.description && (
          <section>
            <h2>Présentation</h2>
            <p>{institute.description}</p>
          </section>
        )}

        {institute.benefits.length > 0 && (
          <section>
            <h2>Avantages</h2>
            <ul className="checklist">
              {institute.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2>Coordonnées et inscriptions</h2>
          <div className="lines">
            {institute.address && (
              <div>
                <span>Adresse</span>
                <span>{institute.address}, Brazzaville</span>
              </div>
            )}
            {institute.phone && (
              <div>
                <span>Téléphone</span>
                <span className="num">{institute.phone}</span>
              </div>
            )}
            {institute.email && (
              <div>
                <span>E-mail</span>
                <a className="ilnk" href={`mailto:${institute.email}?subject=${subject}`}>
                  {institute.email}
                </a>
              </div>
            )}
            <div>
              <span>Frais d'inscription</span>
              <span className="num">{formatFcfa(institute.registration_fee)}</span>
            </div>
            {institute.registration_deadline && (
              <div>
                <span>Clôture des inscriptions</span>
                <span>{formatDate(institute.registration_deadline)}</span>
              </div>
            )}
            {institute.start_date && (
              <div className="tot">
                <span>Rentrée</span>
                <span>{formatDate(institute.start_date)}</span>
              </div>
            )}
          </div>

          <p>
            {institute.whatsapp && (
              <>
                <a
                  className="btn wa"
                  href={`https://wa.me/${institute.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp — message pré-rempli
                </a>{' '}
              </>
            )}
            {institute.email && (
              <>
                <a className="btn line" href={`mailto:${institute.email}?subject=${subject}`}>
                  Écrire par e-mail
                </a>{' '}
              </>
            )}
            {institute.phone && (
              <a className="btn line" href={`tel:${institute.phone.replace(/\s/g, '')}`}>
                Appeler
              </a>
            )}
          </p>
        </section>

        {programs.length > 0 && (
          <>
            <section>
              <h2>Diplômes délivrés et débouchés</h2>
              <div className="pills">
                {institute.degrees.map((degree) => (
                  <span className="pill" key={degree}>
                    {degree}
                  </span>
                ))}
              </div>
              <div className="jobgrid">
                {careers.map((name) =>
                  careerId(name) ? (
                    <Link className="job" key={name} to={`${ROUTES.accueil}?vue=form&career_id=${careerId(name)}`}>
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
            </section>

            <section>
              <h2>Tarifs et conditions d'admission</h2>
              <div className="tblwrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Diplôme</th>
                      <th>Durée</th>
                      <th>Frais par an</th>
                      <th>Admission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => (
                      <tr key={program.id}>
                        <td>
                          <Link className="ilnk" to={ROUTES.formation(program.id)}>
                            {program.name}
                          </Link>
                        </td>
                        <td>{program.degree.name}</td>
                        <td>{formatDuration(program.duration)}</td>
                        <td className="num">
                          {feeLines(program).map((line, index) => (
                            <span key={line.label}>
                              {index > 0 && <br />}
                              {line.label && `${line.label} : `}
                              {formatFcfa(line.amount)}
                            </span>
                          ))}
                        </td>
                        <td>{admissionText(program)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <section>
          <h2>Formations proposées ({programs.length})</h2>
          <div className="grid">
            {programs.length > 0 ? (
              programs.map((program) => <FormationCard key={program.id} program={program} />)
            ) : (
              <div className="empty">
                <h3>Aucune formation publiée</h3>
                <p>La Squad n'a pas encore saisi les formations de cet institut.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FicheInstitut;
