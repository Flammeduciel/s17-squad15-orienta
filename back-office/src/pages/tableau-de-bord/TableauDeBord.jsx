/* Tableau de bord — route /admin (ticket P11).
   Maquette : template/back-office.html. */
import { Link } from 'react-router-dom';
import { getDistricts, getDomains, getIndicators, getInstitutes, getPrograms } from '../../api/catalogue';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { fcfa } from '../../utils/format';

// Une carte d'indicateur : la valeur, son libellé, une icône.
function Stat({ value, label, icon, tone = '' }) {
  return (
    <div className="stat">
      <div className="row">
        <div>
          <b>{value}</b>
          <small>{label}</small>
        </div>
        <span className={`ico ${tone}`}>
          <Icon name={icon} />
        </span>
      </div>
    </div>
  );
}

const addLink = { justifyContent: 'flex-start' };

function TableauDeBord() {
  const { data, loading, error } = useApi(async () => {
    const [indicators, programs, institutes, domains, districts] = await Promise.all([
      getIndicators(),
      getPrograms(),
      getInstitutes(),
      getDomains(),
      getDistricts(),
    ]);
    return { indicators, programs, institutes, domains, districts };
  }, []);

  if (!data) return <PageState loading={loading} error={error} />;

  const { indicators, programs, institutes, domains, districts } = data;
  const drafts = programs.filter((program) => program.status !== 'published').length;
  const notAccredited = institutes.filter((institute) => !institute.accredited).length;
  const average = programs.reduce((sum, program) => sum + program.tuition, 0) / Math.max(1, programs.length);
  // Les six domaines qui comptent le plus de formations.
  const byDomain = domains
    .map((domain) => ({
      domain,
      total: programs.filter((program) => program.domain.id === domain.id).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const max = Math.max(1, ...byDomain.map((item) => item.total));

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Tableau de bord</h1>
          <p>Indicateurs clés du catalogue.</p>
        </div>
        <Link className="btn" to={`${ROUTES.instituts}/nouveau`}>
          <Icon name="plus" />
          Ajouter un institut
        </Link>
      </div>

      {/* Les 5 KPI de EX-07, servis par GET /admin/indicators. */}
      <div className="cards">
        <Stat value={indicators.nb_institutes} label="Établissements" icon="building" />
        <Stat value={indicators.nb_programs} label="Formations et filières" icon="cap" tone="blue" />
        <Stat
          value={`${indicators.nb_districts_covered} / ${districts.length}`}
          label="Arrondissements couverts"
          icon="pin"
        />
        <Stat value={indicators.nb_degrees} label="Diplômes délivrés" icon="award" tone="blue" />
        <Stat value={indicators.nb_careers} label="Débouchés" icon="brief" />
      </div>

      <div className="split">
        <div className="panel">
          <header>
            <h2>Répartition par domaine</h2>
            <small>{programs.length} formations</small>
          </header>
          <div className="pad" style={{ display: 'grid', gap: 12 }}>
            {byDomain.map(({ domain, total }) => (
              <div
                key={domain.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px minmax(0,1fr) 34px',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>{domain.name}</span>
                <span style={{ height: 10, borderRadius: 99, background: 'var(--soft)', overflow: 'hidden' }}>
                  <span
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${Math.round((total / max) * 100)}%`,
                      background: domain.color,
                    }}
                  />
                </span>
                <b className="num" style={{ textAlign: 'right' }}>
                  {total}
                </b>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="panel">
            <header>
              <h2>Points de vigilance</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 14 }}>
              <div className="kv">
                <div>
                  <span>Formations en brouillon</span>
                  <b>{drafts}</b>
                </div>
                <div>
                  <span>Instituts non agréés</span>
                  <b>{notAccredited}</b>
                </div>
                <div>
                  <span>Frais moyens par an</span>
                  <b>{fcfa(Math.round(average))}</b>
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
                Une formation en brouillon n'apparaît pas sur le site public.
              </p>
            </div>
          </div>

          <div className="panel">
            <header>
              <h2>Ajouter</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 10 }}>
              <Link className="btn line" to={`${ROUTES.instituts}/nouveau`} style={addLink}>
                <Icon name="plus" />
                Un institut
              </Link>
              <Link className="btn line" to={`${ROUTES.formations}/nouvelle`} style={addLink}>
                <Icon name="plus" />
                Une formation
              </Link>
              <Link className="btn line" to={ROUTES.cours} style={addLink}>
                <Icon name="plus" />
                Un cours
              </Link>
              <Link className="btn line" to={ROUTES.diplomes} style={addLink}>
                <Icon name="plus" />
                Un diplôme
              </Link>
              <Link className="btn line" to={ROUTES.debouches} style={addLink}>
                <Icon name="plus" />
                Un débouché
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TableauDeBord
