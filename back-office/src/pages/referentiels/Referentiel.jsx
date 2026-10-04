import { useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PageState from '../../components/PageState';
import { useToast } from '../../context/toast-context';
import { useApi } from '../../hooks/useApi';
import { errorMessage } from '../../utils/format';

/**
 * Écran commun aux quatre référentiels (diplômes, débouchés, séries du bac,
 * domaines d'insertion) : une liste, un formulaire à deux champs ouvert dans
 * une fenêtre, une suppression avec confirmation. Chaque page lui passe sa configuration.
 *
 * config :
 * - title, intro : titre et phrase d'introduction de la page ;
 * - nom, un, le, ce, aucun : le mot du référentiel et ses articles
 *   (« diplôme », « un diplôme », « le diplôme », « ce diplôme », « Aucun diplôme ») ;
 * - nameKey, nameLabel, namePlaceholder : champ qui porte l'intitulé (`name` ou `code`) ;
 * - column : titre de la deuxième colonne ; cell(row, data) : son contenu ;
 * - empty : valeurs d'un formulaire vide ; field(form, setForm, data) : le deuxième champ ;
 * - toBody(form) : corps envoyé à l'API ;
 * - load() : charge { rows, programs, … } ; usage(row, data) : nombre de formations qui l'utilisent ;
 * - create(body), update(id, body), remove(id) : appels à l'API.
 */
export default function Referentiel({ config }) {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(config.load, []);
  // editing : null (liste seule), 'new' (ajout) ou la ligne en cours de modification.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(config.empty);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  if (!data) return <PageState loading={loading} error={error} />;

  const { rows } = data;
  const nameOf = (row) => row[config.nameKey];

  const startAdd = () => {
    setForm(config.empty);
    setFormError('');
    setEditing('new');
  };
  const startEdit = (row) => {
    setForm({ ...config.empty, ...row });
    setFormError('');
    setEditing(row);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const name = String(form[config.nameKey] ?? '').trim();
    if (!name) {
      setFormError('Ce champ est obligatoire.');
      return;
    }
    const body = config.toBody({ ...form, [config.nameKey]: name });
    try {
      if (editing === 'new') {
        await config.create(body);
        toast(`« ${name} » ajouté au référentiel.`);
      } else {
        await config.update(editing.id, body);
        toast(`« ${name} » mis à jour.`);
      }
      setEditing(null);
      reload();
    } catch (err) {
      // Nom déjà pris (409) ou champ refusé (400) : l'API dit pourquoi.
      setFormError(errorMessage(err));
    }
  };

  const onDelete = async () => {
    const row = toDelete;
    setToDelete(null);
    try {
      await config.remove(row.id);
      toast(`« ${nameOf(row)} » supprimé du référentiel.`);
      reload();
    } catch (err) {
      // Encore utilisé par une formation : l'API refuse (409) et dit par combien.
      toast(errorMessage(err), true);
    }
  };

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{config.title}</h1>
          <p>{config.intro}</p>
        </div>
        <button className="btn" type="button" onClick={startAdd}>
          <Icon name="plus" />
          Ajouter {config.un}
        </button>
      </div>

      {/* L'ajout et la modification se font dans une fenêtre, par-dessus la liste. */}
      {editing && (
        <Modal
          size="medium"
          title={editing === 'new' ? `Ajouter ${config.un}` : `Modifier ${config.le}`}
          onClose={() => setEditing(null)}
        >
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="row two">
              <div className={`fld${formError ? ' bad' : ''}`}>
                <label htmlFor="r-nom">{config.nameLabel}</label>
                <input
                  id="r-nom"
                  autoFocus
                  placeholder={config.namePlaceholder}
                  value={form[config.nameKey] ?? ''}
                  onChange={(event) => setForm({ ...form, [config.nameKey]: event.target.value })}
                />
                {formError && (
                  <span className="err" role="alert">
                    {formError}
                  </span>
                )}
              </div>
              {config.field(form, setForm, data)}
            </div>
            <div className="formfoot">
              <button className="btn" type="submit">
                {editing === 'new' ? 'Ajouter' : 'Enregistrer les modifications'}
              </button>
              <button className="btn line" type="button" onClick={() => setEditing(null)}>
                Annuler
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="panel">
        <header>
          <h2>
            {rows.length} {config.nom}
            {rows.length > 1 ? 's' : ''}
          </h2>
        </header>
        {rows.length === 0 ? (
          <div className="pad">
            <div className="empty">
              <h3>{config.aucun}</h3>
              <p>Ajoutez-en pour pouvoir les rattacher aux formations.</p>
            </div>
          </div>
        ) : (
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{config.nameLabel}</th>
                  <th>{config.column}</th>
                  <th className="num">Formations</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <b>{nameOf(row)}</b>
                    </td>
                    <td>{config.cell(row, data)}</td>
                    <td className="num">{config.usage(row, data)}</td>
                    <td>
                      <div className="acts">
                        <button
                          className="act"
                          type="button"
                          title="Modifier"
                          aria-label={`Modifier ${nameOf(row)}`}
                          onClick={() => startEdit(row)}
                        >
                          <Icon name="pencil" />
                        </button>
                        <button
                          className="act del"
                          type="button"
                          title="Supprimer"
                          aria-label={`Supprimer ${nameOf(row)}`}
                          onClick={() => setToDelete(row)}
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
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title={`Supprimer ${config.ce} ?`}
          body={`« ${nameOf(toDelete)} » sera retiré du référentiel. Cette action est définitive.`}
          onConfirm={onDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
