/* Diplômes — route /admin/diplomes (ticket P20).
   Maquette : template/back-office.html. */
import { createDegree, deleteDegree, getDegrees, getPrograms, updateDegree } from '../../api/catalogue';
import { ans } from '../../utils/format';
import Referentiel from './Referentiel';

const config = {
  title: 'Diplômes',
  intro: "Référentiel des diplômes délivrés, avec leur durée d'études : il alimente les formations et la recherche publique.",
  nom: 'diplôme',
  un: 'un diplôme',
  le: 'le diplôme',
  ce: 'ce diplôme',
  aucun: 'Aucun diplôme',
  nameKey: 'name',
  nameLabel: 'Intitulé',
  namePlaceholder: 'ex. Licence',
  column: 'Durée des études',
  cell: (degree) => ans(degree.duration),
  empty: { name: '', duration: 2 },
  // La durée s'applique à toutes les formations qui délivrent ce diplôme.
  field: (form, setForm) => (
    <div className="fld">
      <label htmlFor="r-duree">Durée des études</label>
      <select
        id="r-duree"
        value={form.duration}
        onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })}
      >
        {[1, 2, 3, 4, 5].map((duration) => (
          <option key={duration} value={duration}>
            {ans(duration)}
          </option>
        ))}
      </select>
      <span className="hint">S'applique à toutes les formations qui délivrent ce diplôme.</span>
    </div>
  ),
  toBody: (form) => ({ name: form.name, duration: form.duration }),
  load: async () => {
    const [rows, programs] = await Promise.all([getDegrees(), getPrograms()]);
    return { rows, programs };
  },
  usage: (degree, data) => data.programs.filter((program) => program.degree.id === degree.id).length,
  create: createDegree,
  update: updateDegree,
  remove: deleteDegree,
};

function Diplomes() {
  return <Referentiel config={config} />
}

export default Diplomes
