/* Villes - route /admin/villes. */
import { createCity, deleteCity, getCities, getDistricts, updateCity } from '../../api/catalogue';
import { pluriel } from '../../utils/format';
import Referentiel from './Referentiel';

const config = {
  title: 'Villes',
  intro: 'Référentiel des villes couvertes par Orienta. Chaque ville est découpée en arrondissements.',
  nom: 'ville',
  un: 'une ville',
  le: 'la ville',
  ce: 'cette ville',
  aucun: 'Aucune ville',
  emptyHint: 'Ajoutez une ville, puis ses arrondissements, pour pouvoir y situer des instituts.',
  nameKey: 'name',
  nameLabel: 'Nom',
  namePlaceholder: 'ex. Brazzaville',
  column: 'Arrondissements',
  cell: (city) => pluriel(city.district_count, 'arrondissement'),
  empty: { name: '' },
  // Une ville n'a qu'un nom : pas de second champ.
  field: () => null,
  toBody: (form) => ({ name: form.name }),
  load: async () => {
    const [rows, districts] = await Promise.all([getCities(), getDistricts()]);
    return { rows, districts };
  },
  // Instituts situés dans les arrondissements de la ville.
  usageLabel: 'Instituts',
  usage: (city, data) =>
    data.districts
      .filter((district) => district.city_id === city.id)
      .reduce((total, district) => total + district.institute_count, 0),
  create: createCity,
  update: updateCity,
  remove: deleteCity,
};

function Villes() {
  return <Referentiel config={config} />
}

export default Villes
