/* Domaines d'insertion — route /admin/domaines (ticket P23).
   Maquette : template/back-office.html. */
import {
  createDomain,
  deleteDomain,
  getCareers,
  getDomains,
  getPrograms,
  updateDomain,
} from '../../api/catalogue';
import Icon from '../../components/Icon';
import Referentiel from './Referentiel';

// Icônes proposées pour un domaine : des noms Font Awesome (style « solid »).
// Pour en proposer une autre, ajouter son nom ici : https://fontawesome.com/icons
const DOMAIN_ICONS = [
  'chart-line',
  'coins',
  'building-columns',
  'laptop-code',
  'microchip',
  'network-wired',
  'stethoscope',
  'user-nurse',
  'pills',
  'helmet-safety',
  'compass-drafting',
  'gears',
  'oil-well',
  'gem',
  'bolt',
  'bullhorn',
  'newspaper',
  'camera',
  'truck',
  'ship',
  'plane',
  'scale-balanced',
  'landmark',
  'handshake',
  'leaf',
  'tractor',
  'seedling',
  'hotel',
  'utensils',
  'umbrella-beach',
  'palette',
  'music',
  'flask',
  'chalkboard-user',
  'language',
  'shapes',
];

// Pastille du tableau : l'icône du domaine sur sa couleur.
const swatch = {
  display: 'inline-grid',
  placeItems: 'center',
  width: 30,
  height: 30,
  borderRadius: 8,
  verticalAlign: 'middle',
  color: '#fff',
  fontSize: 14,
};

const config = {
  title: "Domaines d'insertion",
  intro: "Référentiel des domaines d'insertion : ils classent les formations et les débouchés, et forment la barre de catégories du site public.",
  nom: 'domaine',
  un: 'un domaine',
  le: 'le domaine',
  ce: 'ce domaine',
  aucun: 'Aucun domaine',
  nameKey: 'name',
  nameLabel: 'Intitulé',
  namePlaceholder: 'ex. Informatique',
  column: 'Icône et couleur',
  cell: (domain, data) => (
    <>
      <span style={{ ...swatch, background: domain.color }}>
        <Icon name={domain.icon} />
      </span>{' '}
      <small style={{ color: 'var(--muted)' }}>
        {data.careers.filter((career) => career.domain_id === domain.id).length} débouché(s)
      </small>
    </>
  ),
  empty: { name: '', color: '#1E6B4A', icon: 'shapes' },
  field: (form, setForm) => (
    <>
      <div className="fld">
        <label htmlFor="r-coul">Couleur</label>
        <input
          id="r-coul"
          type="color"
          style={{ height: 46, padding: 4 }}
          value={form.color}
          onChange={(event) => setForm({ ...form, color: event.target.value })}
        />
        <span className="hint">Couleur des vignettes des formations de ce domaine.</span>
      </div>
      <div className="fld full">
        <label>Icône</label>
        <div className="iconpick" role="group" aria-label="Icône du domaine">
          {/* Une icône choisie avant qu'on la retire de la liste reste proposée. */}
          {[...new Set([...DOMAIN_ICONS, form.icon])].map((name) => (
            <button
              type="button"
              key={name}
              title={name}
              aria-label={name}
              aria-pressed={form.icon === name}
              onClick={() => setForm({ ...form, icon: name })}
            >
              <Icon name={name} />
            </button>
          ))}
        </div>
        <span className="hint">Affichée dans la barre des domaines et sur les vignettes du site public.</span>
      </div>
    </>
  ),
  toBody: (form) => ({ name: form.name, color: form.color, icon: form.icon }),
  load: async () => {
    const [rows, programs, careers] = await Promise.all([getDomains(), getPrograms(), getCareers()]);
    return { rows, programs, careers };
  },
  usage: (domain, data) => data.programs.filter((program) => program.domain.id === domain.id).length,
  create: createDomain,
  update: updateDomain,
  remove: deleteDomain,
};

function Domaines() {
  return <Referentiel config={config} />
}

export default Domaines
