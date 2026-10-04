/* Arrondissements - route /admin/arrondissements. */
import { createDistrict, deleteDistrict, getCities, getDistricts, updateDistrict } from '../../api/catalogue';
import Referentiel from './Referentiel';

const config = {
  title: 'Arrondissements',
  intro: "Référentiel des arrondissements, rattachés à une ville. Un institut est situé dans un arrondissement.",
  nom: 'arrondissement',
  un: 'un arrondissement',
  le: "l'arrondissement",
  ce: 'cet arrondissement',
  aucun: 'Aucun arrondissement',
  emptyHint: "Ajoutez d'abord une ville, puis ses arrondissements, pour pouvoir y situer des instituts.",
  nameKey: 'name',
  nameLabel: 'Nom',
  namePlaceholder: 'ex. Makélékélé',
  column: 'Ville',
  cell: (district) => district.city,
  empty: { name: '', city_id: '' },
  field: (form, setForm, data) => (
    <div className="fld">
      <label htmlFor="r-ville">Ville</label>
      <select
        id="r-ville"
        value={form.city_id || data.cities[0]?.id}
        onChange={(event) => setForm({ ...form, city_id: event.target.value })}
      >
        {data.cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
      {data.cities.length === 0 && <span className="hint">Aucune ville : ajoutez-en une d'abord.</span>}
    </div>
  ),
  // Sans choix dans la liste, c'est la première ville, celle qui est affichée.
  toBody: (form, data) => ({ name: form.name, city_id: form.city_id || data.cities[0]?.id }),
  load: async () => {
    const [rows, cities] = await Promise.all([getDistricts(), getCities()]);
    return { rows, cities };
  },
  // L'API compte déjà les instituts de chaque arrondissement.
  usageLabel: 'Instituts',
  usage: (district) => district.institute_count,
  create: createDistrict,
  update: updateDistrict,
  remove: deleteDistrict,
};

function Arrondissements() {
  return <Referentiel config={config} />
}

export default Arrondissements
