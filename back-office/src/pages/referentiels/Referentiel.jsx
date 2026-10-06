import { useState } from 'react';
import { errorMessage, request } from '../../api/http';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Status from '../../components/Status';
import { useToast } from '../../context/toast-context';
import { useFetch } from '../../hooks/useFetch';
import { plural } from '../../utils/format';

/* Page générique des quatre référentiels (tickets P20 à P23). Chaque page ne fournit
   que sa configuration (voir referentiels.jsx) : liste, formulaire et suppression
   partagent le même canevas. Les suppressions sont refusées par l'API tant que la
   ligne est utilisée (409) — le message du serveur est affiché tel quel.
   Maquette : template/back-office.html (pageRefl). */

function Field({ id, label, error, as: Input = 'input', ...props }) {
  return (
    <div className={`fld${error ? ' bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Input
        id={id}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        {...props}
      />
      {error && (
        <span className="err" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function Referentiel({ config, extra }) {
  const toast = useToast();
  const items = useFetch(config.liste);

  const [form, setForm] = useState(null); // fermé : null ; ouvert : { id: nombre|null, values }
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rows = items.data ?? [];

  const openCreate = () => {
    setErrors({});
    setForm({ id: null, values: config.initial() });
    window.scrollTo(0, 0);
  };

  const openEdit = (item) => {
    setErrors({});
    setForm({ id: item.id, values: config.toValues(item) });
    window.scrollTo(0, 0);
  };

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, values: { ...current.values, [field]: event.target.value } }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    const found = config.validate(form.values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast(`${plural(Object.keys(found).length, 'erreur')} dans le formulaire.`, true);
      return;
    }

    setSaving(true);
    try {
      const payload = config.toPayload(form.values);
      if (form.id) {
        await request(`${config.gestion}/${form.id}`, { method: 'PUT', body: payload });
        toast(`« ${config.affiche(payload)} » modifié.`);
      } else {
        await request(config.gestion, { method: 'POST', body: payload });
        toast(`« ${config.affiche(payload)} » ajouté au référentiel.`);
      }
      setForm(null);
      items.reload();
    } catch (error) {
      toast(errorMessage(error), true);
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await request(`${config.gestion}/${toDelete.id}`, { method: 'DELETE' });
      toast(`« ${config.affiche(toDelete)} » supprimé du référentiel.`);
      if (form?.id === toDelete.id) setForm(null);
      setToDelete(null);
      items.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    } finally {
      setDeleting(false);
    }
  }

  if (items.error) return <Status error={items.error} onRetry={items.reload} />;
  if (!items.data) return <Status loading />;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{config.titre}</h1>
          <p>{config.intro}</p>
        </div>
        {!form && (
          <button className="btn" type="button" onClick={openCreate}>
            <Icon name="plus" />
            Ajouter {config.un}
          </button>
        )}
      </div>

      {form && (
        <form className="form" noValidate onSubmit={submit}>
          <fieldset>
            <legend>{form.id ? `Modifier ${config.le}` : `Ajouter ${config.un}`}</legend>
            <div className="row two">
              <Field
                id="r-nom"
                label={config.etiquette}
                placeholder={config.ph}
                value={form.values[config.cle]}
                onChange={setField(config.cle)}
                error={errors[config.cle]}
              />
              {config.champ(form.values, errors, setField, extra)}
            </div>
          </fieldset>
          <div className="formfoot">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : form.id ? 'Enregistrer les modifications' : 'Ajouter'}
            </button>
            <button className="btn line" type="button" onClick={() => setForm(null)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="panel">
        <header>
          <h2>{plural(rows.length, config.nom)}</h2>
        </header>
        {rows.length > 0 ? (
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{config.etiquette}</th>
                  <th>{config.champTitre}</th>
                  <th className="num">Formations</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{config.affiche(item)}</b>
                    </td>
                    <td>{config.ligne(item, extra)}</td>
                    <td className="num">{config.usage(item, extra)}</td>
                    <td>
                      <div className="acts">
                        <button
                          className="act"
                          type="button"
                          title="Modifier"
                          aria-label={`Modifier ${config.affiche(item)}`}
                          onClick={() => openEdit(item)}
                        >
                          <Icon name="pencil" />
                        </button>
                        <button
                          className="act del"
                          type="button"
                          title="Supprimer"
                          aria-label={`Supprimer ${config.affiche(item)}`}
                          onClick={() => setToDelete(item)}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pad">
            <div className="empty">
              <h3>{config.aucun}</h3>
              <p>Ajoutez-en pour pouvoir les rattacher aux formations.</p>
            </div>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title={`Supprimer ${config.ce} ?`}
          message={`« ${config.affiche(toDelete)} » sera supprimé du référentiel. Cette action est définitive.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}