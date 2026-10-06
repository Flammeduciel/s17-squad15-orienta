/* Liste des instituts - route /admin/instituts (ticket P16).
   Maquette : template/back-office.html. */
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { deleteInstitute, getDistricts, getInstitute, getInstitutes, getPrograms } from '../../api/catalogue';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import Pager from '../../components/Pager';
import { useToast } from '../../context/toast-context';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { errorMessage, fcfa, imageUrl, matches, pageOf, pluriel } from '../../utils/format';

const PER_PAGE = 6;

// La liste de l'API ne donne qu'un résumé de chaque institut : on relit chaque
// fiche pour avoir l'adresse et les contacts. Le catalogue compte peu d'instituts.
async function loadList() {
  const [summaries, programs, districts] = await Promise.all([getInstitutes(), getPrograms(), getDistricts()]);
  const institutes = await Promise.all(summaries.map((institute) => getInstitute(institute.id)));
  return { institutes, programs, districts };
}

function ListeInstituts() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(loadList, []);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  // accredited : '' (tous), 'oui' (agréés) ou 'non' (non agréés).
  const [accredited, setAccredited] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  if (!data) return <PageState loading={loading} error={error} />;

  // Nombre de formations d'un institut, brouillons compris.
  const programCount = (id) => data.programs.filter((program) => program.institute.id === id).length;

  const rows = data.institutes.filter((institute) => {
    const text = `${institute.name} ${institute.short_name} ${institute.district} ${institute.city} ${institute.address}`;
    if (!matches(search, text)) return false;
    if (district && institute.district_id !== district) return false;
    if (accredited === 'oui' && !institute.accredited) return false;
    if (accredited === 'non' && institute.accredited) return false;
    return true;
  });
  const visible = pageOf(rows, page, PER_PAGE);

  // Chaque changement de filtre ramène à la première page.
  const filter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch('');
    setDistrict('');
    setAccredited('');
    setPage(1);
  };

  const onDelete = async () => {
    const institute = toDelete;
    const count = programCount(institute.id);
    setToDelete(null);
    try {
      await deleteInstitute(institute.id);
      toast(`Institut supprimé${count ? ` avec ${count} formation(s) rattachée(s).` : '.'}`);
      reload();
    } catch (err) {
      toast(errorMessage(err), true);
    }
  };

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Instituts</h1>
          <p>
            {pluriel(data.institutes.length, 'institut')} référencé{data.institutes.length > 1 ? 's' : ''}, pour{' '}
            {pluriel(data.districts.length, 'arrondissement')} enregistré{data.districts.length > 1 ? 's' : ''}.
          </p>
        </div>
        <Link className="btn" to={`${ROUTES.instituts}/nouveau`}>
          <Icon name="plus" />
          Ajouter un institut
        </Link>
      </div>

      <div className="panel">
        <header>
          <div className="toolbar">
            <span className="field">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Rechercher un institut"
                aria-label="Rechercher"
                value={search}
                onChange={(event) => filter(setSearch)(event.target.value)}
              />
            </span>
            <select
              className="field"
              aria-label="Filtrer par arrondissement"
              value={district}
              onChange={(event) => filter(setDistrict)(event.target.value)}
            >
              <option value="">Tous les arrondissements</option>
              {data.districts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.city})
                </option>
              ))}
            </select>
            <div className="seg" role="group" aria-label="Filtrer par agrément">
              {[
                ['', 'Tous'],
                ['oui', 'Agréés'],
                ['non', 'Non agréés'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={accredited === value}
                  onClick={() => filter(setAccredited)(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <small>
            {rows.length} résultat{rows.length > 1 ? 's' : ''}
          </small>
        </header>

        {visible.length === 0 ? (
          <div className="pad">
            <div className="empty">
              <h3>Aucun institut ne correspond</h3>
              <p>Modifiez la recherche ou les filtres.</p>
              <button className="btn line" type="button" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Institut</th>
                    <th>Arrondissement</th>
                    <th>Contact</th>
                    <th>Agrément</th>
                    <th className="num">Formations</th>
                    <th className="num">Inscription</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((institute) => (
                    <tr key={institute.id}>
                      <td>
                        <div className="who">
                          <span className="thumb" style={{ background: institute.color }}>
                            {institute.image_url ? (
                              <img src={imageUrl(institute.image_url)} alt="" />
                            ) : (
                              institute.short_name
                            )}
                          </span>
                          <span>
                            <b>{institute.name}</b>
                            <small>{institute.address}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        {institute.district}
                        <br />
                        <small style={{ color: 'var(--muted)' }}>{institute.city}</small>
                      </td>
                      <td>
                        <small>{institute.phone}</small>
                        <br />
                        <small style={{ color: 'var(--muted)' }}>{institute.email}</small>
                      </td>
                      <td>
                        {institute.accredited ? (
                          <span className="agb">
                            <Icon name="check" />
                            {institute.accreditation_number}
                          </span>
                        ) : (
                          <span className="agb p">Non agréé</span>
                        )}
                      </td>
                      <td className="num">{programCount(institute.id)}</td>
                      <td className="num">{fcfa(institute.registration_fee)}</td>
                      <td>
                        <div className="acts">
                          <Link
                            className="act"
                            to={`${ROUTES.instituts}/${institute.id}`}
                            title="Modifier"
                            aria-label={`Modifier ${institute.name}`}
                          >
                            <Icon name="pencil" />
                          </Link>
                          <button
                            className="act del"
                            type="button"
                            title="Supprimer"
                            aria-label={`Supprimer ${institute.name}`}
                            onClick={() => setToDelete(institute)}
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
            <Pager total={rows.length} perPage={PER_PAGE} page={page} onPage={setPage} />
          </>
        )}
      </div>

      {/* Formulaire d'ajout ou de modification : il s'ouvre en fenêtre sur cette liste
          (routes /admin/instituts/nouveau et /admin/instituts/:id). */}
      <Outlet context={{ reloadList: reload }} />

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cet institut ?"
          body={`« ${toDelete.name} » sera retiré${
            programCount(toDelete.id) ? ` ainsi que ${programCount(toDelete.id)} de ses formations` : ''
          }. Cette action est définitive.`}
          onConfirm={onDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

export default ListeInstituts
