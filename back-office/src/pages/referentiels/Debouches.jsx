/* Débouchés - route /admin/debouches (ticket P21).
   Maquette : template/back-office.html. */
import { createCareer, deleteCareer, getCareers, getDomains, updateCareer } from '../../api/catalogue';
import Referentiel from './Referentiel';

const config = {
  title: 'Débouchés',
  intro: 'Référentiel des débouchés professionnels, rattachés aux formations.',
  nom: 'débouché',
  un: 'un débouché',
  le: 'le débouché',
  ce: 'ce débouché',
  aucun: 'Aucun débouché',
  nameKey: 'name',
  nameLabel: 'Intitulé',
  namePlaceholder: 'ex. Comptable',
  column: "Domaine d'insertion",
  cell: (career, data) => data.domains.find((domain) => domain.id === career.domain_id)?.name ?? '-',
  empty: { name: '', domain_id: '' },
  field: (form, setForm, data) => (
    <div className="fld">
      <label htmlFor="r-sect">Domaine d'insertion</label>
      <select
        id="r-sect"
        value={form.domain_id || data.domains[0]?.id}
        onChange={(event) => setForm({ ...form, domain_id: event.target.value })}
      >
        {data.domains.map((domain) => (
          <option key={domain.id} value={domain.id}>
            {domain.name}
          </option>
        ))}
      </select>
    </div>
  ),
  // Sans choix dans la liste, c'est le premier domaine, celui qui est affiché.
  toBody: (form, data) => ({ name: form.name, domain_id: form.domain_id || data.domains[0]?.id }),
  load: async () => {
    const [rows, domains] = await Promise.all([getCareers(), getDomains()]);
    return { rows, domains };
  },
  // L'API compte déjà les formations de chaque débouché.
  usage: (career) => career.program_count,
  create: createCareer,
  update: updateCareer,
  remove: deleteCareer,
};

function Debouches() {
  return <Referentiel config={config} />
}

export default Debouches
