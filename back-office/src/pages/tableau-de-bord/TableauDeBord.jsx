import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { formatFcfa, plural } from '../../utils/format';

/* Tableau de bord — route /admin (ticket P11).
   Les 5 indicateurs viennent de GET /admin/indicators. Maquette : template/back-office.html. */

// Les 5 cartes du haut : valeur, libellé, icône et ton.
const STATS = [
  ['nb_institutes', 'Établissements', 'building', ''],
  ['nb_programs', 'Formations et filières', 'cap', 'blue'],
  ['nb_districts_covered', 'Arrondissements couverts', 'grid', ''],
  ['nb_degrees', 'Diplômes délivrés', 'award', 'blue'],
  ['nb_careers', 'Débouchés', 'brief', ''],
];

// Répartition des formations par domaine (6 premiers), pour les barres du panneau.
function parDomaine(programs) {
  const groupes = {};
  for (const program of programs) {
    const domaine = program.domain;
    groupes[domaine.id] ??= { nom: domaine.name, couleur: domaine.color, n: 0 };
    groupes[domaine.id].n += 1;
  }
  return Object.values(groupes)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
}

function TableauDeBord() {
  const indicators = useFetch('/admin/indicators');
  const programs = useFetch('/admin/programs');
  const institutes = useFetch('/institutes');

  if (indicators.loading && !indicators.data) {
    return (
      <div className="pagehead">
        <div>
          <h1>Tableau de bord</h1>
          <p>Indicateurs clés du catalogue.</p>
        </div>
        <Status loading />
      </div>
    );
  }
  if (indicators.error) {
    return (
      <div className="pagehead">
        <div>
          <h1>Tableau de bord</h1>
          <p>Indicateurs clés du catalogue.</p>
        </div>
        <Status error={indicators.error} onRetry={indicators.reload} />
      </div>
    );
  }

  const formations = programs.data?.items ?? [];
  const brouillons = formations.filter((program) => program.status === 'draft').length;
  const instituts = institutes.data?.items ?? [];
  const nonAgrees = instituts.filter((institut) => !institut.accredited).length;
  const fraisMoyen = formations.length
    ? Math.round(formations.reduce((somme, program) => somme + program.tuition, 0) / formations.length)
    : 0;
  const domaines = parDomaine(formations);
  const maxDomaine = Math.max(1, ...domaines.map((domaine) => domaine.n));

  const ajout = [
    { label: 'Un institut', href: `${ROUTES.instituts}/nouveau` },
    { label: 'Une formation', href: `${ROUTES.formations}/nouvelle` },
    { label: 'Un cours', href: ROUTES.cours },
    { label: 'Un diplôme', href: ROUTES.diplomes },
    { label: 'Un débouché', href: ROUTES.debouches },
  ];

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

      <div className="cards">
        {STATS.map(([cle, libelle, icone, ton]) => (
          <div className="stat" key={cle}>
            <div className="row">
              <div>
                <b>{indicators.data[cle]}</b>
                <small>{libelle}</small>
              </div>
              <span className={`ico ${ton}`}>
                <Icon name={icone} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="split">
        <div className="panel">
          <header>
            <h2>Répartition par domaine</h2>
            <small>{plural(formations.length, 'formation')}</small>
          </header>
          <div className="pad" style={{ display: 'grid', gap: 12 }}>
            {domaines.length > 0 ? (
              domaines.map((domaine) => (
                <div
                  key={domaine.nom}
                  style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 34px', gap: 12, alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{domaine.nom}</span>
                  <span style={{ height: 10, borderRadius: 99, background: 'var(--soft)', overflow: 'hidden' }}>
                    <span
                      style={{
                        display: 'block',
                        height: '100%',
                        width: `${Math.round((domaine.n / maxDomaine) * 100)}%`,
                        background: domaine.couleur,
                      }}
                    />
                  </span>
                  <b className="num" style={{ textAlign: 'right' }}>
                    {domaine.n}
                  </b>
                </div>
              ))
            ) : (
              <p>Aucune formation au catalogue.</p>
            )}
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
                  <b>{brouillons}</b>
                </div>
                <div>
                  <span>Instituts non agréés</span>
                  <b>{nonAgrees}</b>
                </div>
                <div>
                  <span>Frais moyens par an</span>
                  <b>{formatFcfa(fraisMoyen)}</b>
                </div>
              </div>
              <p>Une formation en brouillon n'apparaît pas sur le site public.</p>
            </div>
          </div>

          <div className="panel">
            <header>
              <h2>Ajouter</h2>
            </header>
            <div className="pad" style={{ display: 'grid', gap: 10 }}>
              {ajout.map((action) => (
                <Link key={action.label} className="btn line" to={action.href} style={{ justifyContent: 'flex-start' }}>
                  <Icon name="plus" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TableauDeBord;