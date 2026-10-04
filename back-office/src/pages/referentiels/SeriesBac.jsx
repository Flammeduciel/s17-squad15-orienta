/* Séries du bac — route /admin/series (ticket P22).
   Maquette : template/back-office.html. */
import { createBacSeries, deleteBacSeries, getBacSeries, getPrograms, updateBacSeries } from '../../api/catalogue';
import Referentiel from './Referentiel';

const config = {
  title: 'Séries du bac',
  intro: "Référentiel des séries du baccalauréat. Elles se rattachent aux formations comme conditions d'admission et servent de filtre sur le site public.",
  nom: 'série',
  un: 'une série',
  le: 'la série',
  ce: 'cette série',
  aucun: 'Aucune série',
  nameKey: 'code',
  nameLabel: 'Série',
  namePlaceholder: 'ex. A',
  column: 'Libellé',
  cell: (series) => series.label || '—',
  empty: { code: '', label: '' },
  field: (form, setForm) => (
    <div className="fld">
      <label htmlFor="r-lib">Libellé</label>
      <input
        id="r-lib"
        placeholder="ex. Lettres"
        value={form.label ?? ''}
        onChange={(event) => setForm({ ...form, label: event.target.value })}
      />
      <span className="hint">Les séries se rattachent ensuite aux formations, dans leur fiche.</span>
    </div>
  ),
  toBody: (form) => ({ code: form.code, label: form.label || null }),
  load: async () => {
    const [rows, programs] = await Promise.all([getBacSeries(), getPrograms()]);
    return { rows, programs };
  },
  usage: (series, data) => data.programs.filter((program) => program.bac_series.includes(series.code)).length,
  create: createBacSeries,
  update: updateBacSeries,
  remove: deleteBacSeries,
};

function SeriesBac() {
  return <Referentiel config={config} />
}

export default SeriesBac
