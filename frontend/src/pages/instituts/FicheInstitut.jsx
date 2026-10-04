/* Fiche institut - route /instituts/:id (ticket P6).
   Maquette : template/index.html. */
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCareers, getInstitute } from '../../api/catalogue';
import AccreditationBadge from '../../components/AccreditationBadge';
import CareerButtons from '../../components/CareerButtons';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import ProgramCard from '../../components/ProgramCard';
import { useApi } from '../../hooks/useApi';
import { ROUTES, formationPath } from '../../routes';
import { admission, ans, dateFr, fcfa, imageUrl, mailLink, niveau, whatsappLink } from '../../utils/format';

const photoStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

// Frais d'une formation : un seul montant s'ils sont identiques chaque année,
// sinon une ligne par niveau.
function Fees({ program }) {
  const amounts = program.fees.map((fee) => fee.amount);
  if (new Set(amounts).size <= 1) return fcfa(program.tuition);
  return program.fees.map((fee) => (
    <div key={fee.year}>
      {niveau(fee.year)} : {fcfa(fee.amount)}
    </div>
  ));
}

function FicheInstitut() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(
    () => Promise.all([getInstitute(id), getCareers()]).then(([institute, careers]) => ({ institute, careers })),
    [id],
  );

  useEffect(() => {
    if (data) document.title = `${data.institute.name} · Orienta`;
  }, [data]);

  if (!data) return <PageState loading={loading} error={error} notFound="Institut introuvable" onRetry={reload} />;

  const { institute, careers } = data;
  const { programs } = institute;
  const degrees = [...new Set(programs.map((program) => program.degree.name))];
  const careerNames = [...new Set(programs.flatMap((program) => program.careers))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );
  const waMessage = `Bonjour ${institute.short_name}, je souhaite obtenir des informations sur vos formations.`;

  // Bannière de la fiche ; sans bannière, on reprend l'image des cartes.
  const banner = institute.banner_url || institute.image_url;

  return (
    <div className="wrap detail">
      <Link className="back" to={ROUTES.accueil}>
        <Icon name="back" size={18} />
        Retour aux résultats
      </Link>

      <div className="dtitle">
        <div>
          <h1>{institute.name}</h1>
          <p className="sub">
            <b>{institute.short_name}</b> · {institute.district}, {institute.city}
            {institute.accredited && ' · '}
            <AccreditationBadge institute={institute} />
          </p>
        </div>
      </div>

      <div className="dcover" style={{ background: institute.color, position: 'relative' }}>
        {banner ? (
          <img src={imageUrl(banner)} alt="" style={photoStyle} />
        ) : (
          <span className="big-sigle">{institute.short_name}</span>
        )}
      </div>

      <div className="dmain" style={{ marginTop: 36 }}>
        <section>
          <h2>Présentation</h2>
          <p style={{ maxWidth: '70ch' }}>{institute.description}</p>
        </section>

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
          <div className="lines" style={{ maxWidth: 560 }}>
            <div>
              <span>Adresse</span>
              <span>
                {institute.address}, {institute.city}
              </span>
            </div>
            <div>
              <span>Téléphone</span>
              <span className="num">{institute.phone}</span>
            </div>
            {institute.email && (
              <div>
                <span>E-mail</span>
                <a className="ilnk" href={mailLink(institute, "Demande d'informations")}>
                  {institute.email}
                </a>
              </div>
            )}
            <div>
              <span>Frais d'inscription</span>
              <span className="num">{fcfa(institute.registration_fee)}</span>
            </div>
            <div>
              <span>Clôture des inscriptions</span>
              <span>{dateFr(institute.registration_deadline)}</span>
            </div>
            <div className="tot">
              <span>Rentrée</span>
              <span>{dateFr(institute.start_date)}</span>
            </div>
          </div>
          {/* Contact direct : WhatsApp pré-rempli, e-mail, appel (EX-06). */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <a className="btn wa" href={whatsappLink(institute, waMessage)} target="_blank" rel="noopener">
              WhatsApp (message pré-rempli)
            </a>
            {institute.email && (
              <a className="btn line" href={mailLink(institute, "Demande d'informations")}>
                Écrire par e-mail
              </a>
            )}
            <a className="btn line" href={`tel:${institute.phone.replace(/\s/g, '')}`}>
              Appeler
            </a>
          </div>
        </section>

        {programs.length > 0 && (
          <>
            <section>
              <h2>Diplômes délivrés et débouchés</h2>
              <div className="pills">
                {degrees.map((degree) => (
                  <span className="pill" style={{ cursor: 'default' }} key={degree}>
                    {degree}
                  </span>
                ))}
              </div>
              <CareerButtons names={careerNames} careers={careers} style={{ marginTop: 16 }} />
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
                          <Link className="ilnk" to={formationPath(program.id)}>
                            {program.name}
                          </Link>
                        </td>
                        <td>{program.degree.name}</td>
                        <td>{ans(program.duration)}</td>
                        <td className="num">
                          <Fees program={program} />
                        </td>
                        <td>{admission(program)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <section style={{ borderBottom: 0 }}>
          <h2>Formations proposées ({programs.length})</h2>
          <div className="grid" style={{ marginTop: 8 }}>
            {programs.length === 0 && (
              <div className="empty">
                <h3>Aucune formation publiée</h3>
                <p>La Squad n'a pas encore saisi les formations de cet institut.</p>
              </div>
            )}
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FicheInstitut
