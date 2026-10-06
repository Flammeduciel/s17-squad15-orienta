import { useState } from 'react';
import Icon from '../../components/Icon';
import { useToast } from '../../context/toast-context';
import { plural } from '../../utils/format';

/* Saisie d'un cours (P19) : intitulé et formations rattachées, une par ligne avec
   l'année d'études offerte par le diplôme. Champs de CourseInput dans docs/openapi.yaml.
   Maquette : template/back-office.html. */

// (0) → « 1re année », (1) → « 2e année »…
const niveau = (index) => `${index === 0 ? '1re' : `${index + 1}e`} année`;

export default function CoursForm({ initial, formations, defaultPrograms = [], onSubmit, onCancel }) {
  const toast = useToast();
  const editing = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? '');
  // Une ligne par rattachement { program_id, year }. `defaultPrograms` sert à la création
  // depuis le filtre de la page (le cours arrive déjà rattaché à la formation filtrée).
  const [programs, setPrograms] = useState(() =>
    defaultPrograms.length > 0
      ? defaultPrograms
      : (initial?.programs ?? []).map((lien) => ({ program_id: lien.program_id, year: lien.year })),
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Les années proposées viennent du diplôme de la formation choisie.
  const dureeDe = (programId) => formations.find((formation) => formation.id === Number(programId))?.duration ?? 1;
  const pris = (row) => programs.filter((other) => other !== row).map((lien) => lien.program_id);

  function setRow(row, patch) {
    setPrograms((current) => current.map((other) => (other === row ? { ...other, ...patch } : other)));
  }

  function addRow() {
    setPrograms((current) => {
      const deja = new Set(current.map((lien) => lien.program_id));
      const libre = formations.find((formation) => !deja.has(formation.id));
      return [...current, { program_id: libre?.id ?? '', year: libre ? Math.min(1, libre.duration) : 1 }];
    });
  }

  function removeRow(row) {
    setPrograms((current) => current.filter((other) => other !== row));
  }

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!name.trim()) found.name = "L'intitulé du cours est obligatoire.";
    if (programs.some((lien) => !lien.program_id)) found.programs = 'Choisissez la formation de chaque rattachement.';
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast(`${plural(Object.keys(found).length, 'erreur')} dans le formulaire.`, true);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        programs: programs.map((lien) => ({ program_id: Number(lien.program_id), year: Number(lien.year) })),
      });
    } catch {
      // L'erreur est déjà affichée par la page ; le formulaire reste ouvert pour corriger.
      setSaving(false);
    }
  }

  return (
    <form className="form" noValidate onSubmit={submit}>
      <fieldset>
        <legend>{editing ? 'Modifier le cours' : 'Ajouter un cours'}</legend>
        <div className="row">
          <div className={`fld${errors.name ? ' bad' : ''}`}>
            <label htmlFor="c-name">Intitulé du cours</label>
            <input
              id="c-name"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="ex. Français"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'c-name-err' : undefined}
            />
            {errors.name && (
              <span className="err" id="c-name-err">
                {errors.name}
              </span>
            )}
          </div>
        </div>
        <div className="row">
          <div className={`fld${errors.programs ? ' bad' : ''}`}>
            <label>Formations rattachées</label>
            <div>
              {programs.map((lien, index) => (
                <div className="lien" key={index}>
                  <select
                    aria-label={`Formation rattachée ${index + 1}`}
                    value={String(lien.program_id)}
                    onChange={(event) => {
                      const programId = Number(event.target.value);
                      setRow(lien, { program_id: programId, year: Math.min(lien.year, dureeDe(programId)) });
                      setErrors((current) => ({ ...current, programs: undefined }));
                    }}
                  >
                    <option value="">Choisir…</option>
                    {formations.map((formation) => (
                      <option key={formation.id} value={formation.id} disabled={pris(lien).includes(formation.id)}>
                        {formation.name} — {formation.institute.short_name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={`Année d'études ${index + 1}`}
                    value={lien.year}
                    onChange={(event) => setRow(lien, { year: Number(event.target.value) })}
                  >
                    {Array.from({ length: dureeDe(lien.program_id) }, (_, k) => (
                      <option key={k + 1} value={k + 1}>
                        {niveau(k)}
                      </option>
                    ))}
                  </select>
                  <button
                    className="act del"
                    type="button"
                    aria-label="Retirer ce rattachement"
                    onClick={() => removeRow(lien)}
                  >
                    <Icon name="x" />
                  </button>
                </div>
              ))}
            </div>
            {formations.length > 0 && (
              <button className="btn line sm" type="button" onClick={addRow}>
                <Icon name="plus" />
                Rattacher à une formation
              </button>
            )}
            <span className="hint">
              Les années proposées viennent du diplôme de chaque formation. Un cours sans formation reste au catalogue.
            </span>
            {errors.programs && (
              <span className="err" role="alert">
                {errors.programs}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      <div className="formfoot">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter le cours'}
        </button>
        <button className="btn line" type="button" onClick={onCancel}>
          {editing ? 'Annuler' : 'Terminer'}
        </button>
      </div>
    </form>
  );
}