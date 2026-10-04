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
import Referentiel from './Referentiel';

const swatch = {
  display: 'inline-block',
  width: 22,
  height: 22,
  borderRadius: 6,
  verticalAlign: 'middle',
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
  column: 'Couleur',
  cell: (domain, data) => (
    <>
      <span style={{ ...swatch, background: domain.color }} />{' '}
      <small style={{ color: 'var(--muted)' }}>
        {data.careers.filter((career) => career.domain_id === domain.id).length} débouché(s)
      </small>
    </>
  ),
  empty: { name: '', color: '#1E6B4A' },
  field: (form, setForm) => (
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
  ),
  toBody: (form) => ({ name: form.name, color: form.color }),
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
