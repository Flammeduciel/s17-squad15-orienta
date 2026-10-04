/* Liste des formations — route /admin/formations (ticket P14).
   Maquette : template/back-office.html. */
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { deleteProgram, getDomains, getPrograms } from '../../api/catalogue';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import Pager from '../../components/Pager';
import { useToast } from '../../context/toast-context';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { ans, errorMessage, fcfa, matches, pageOf } from '../../utils/format';

const PER_PAGE = 8;

function ListeFormations() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(
    () => Promise.all([getPrograms(), getDomains()]).then(([programs, domains]) => ({ programs, domains })),
    [],
  );
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  // status : '' (tous), 'published' ou 'draft'.
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  if (!data) return <PageState loading={loading} error={error} />;

  const rows = data.programs
    .filter((program) => {
      const text = [
        program.name,
        program.careers.join(' '),
        program.institute.name,
        program.institute.short_name,
        program.domain.name,
        program.degree.name,
      ].join(' ');
      if (!matches(search, text)) return false;
      if (domain && program.domain.id !== domain) return false;
      if (status && program.status !== status) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const visible = pageOf(rows, page, PER_PAGE);
  const drafts = data.programs.filter((program) => program.status !== 'published').length;

  // Chaque changement de filtre ramène à la première page.
  const filter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch('');
    setDomain('');
    setStatus('');
    setPage(1);
  };

  const onDelete = async () => {
    const program = toDelete;
    setToDelete(null);
    try {
      await deleteProgram(program.id);
      toast(`Formation « ${program.name} » supprimée du catalogue.`);
      reload();
    } catch (err) {
      toast(errorMessage(err), true);
    }
  };

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Formations</h1>
          <p>
            {data.programs.length} formations au catalogue, dont {drafts} en brouillon.
          </p>
        </div>
        <Link className="btn" to={`${ROUTES.formations}/nouvelle`}>
          <Icon name="plus" />
          Ajouter une formation
        </Link>
      </div>

      <div className="panel">
        <header>
          <div className="toolbar">
            <span className="field">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Rechercher une formation, un débouché, un institut"
                aria-label="Rechercher"
                value={search}
                onChange={(event) => filter(setSearch)(event.target.value)}
              />
            </span>
            <select
              className="field"
              aria-label="Filtrer par domaine"
              value={domain}
              onChange={(event) => filter(setDomain)(event.target.value)}
            >
              <option value="">Tous les domaines</option>
              {data.domains.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="seg" role="group" aria-label="Filtrer par statut">
              {[
                ['', 'Tous'],
                ['published', 'Publiées'],
                ['draft', 'Brouillons'],
              ].map(([value, label]) => (
                <button type="button" key={value} aria-pressed={status === value} onClick={() => filter(setStatus)(value)}>
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
              <h3>Aucune formation ne correspond</h3>
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
                    <th>Formation</th>
                    <th>Institut</th>
                    <th>Domaine</th>
                    <th>Diplôme</th>
                    <th className="num">Frais / an</th>
                    <th>Statut</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((program) => (
                    <tr key={program.id}>
                      <td>
                        <div className="who">
                          <span className="thumb" style={{ background: program.domain.color }}>
                            {program.domain.name.slice(0, 3).toUpperCase()}
                          </span>
                          <span>
                            <b>{program.name}</b>
                            <small>{program.careers.slice(0, 2).join(' · ')}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        {program.institute.short_name}
                        <br />
                        <small style={{ color: 'var(--muted)' }}>{program.institute.district}</small>
                      </td>
                      <td>{program.domain.name}</td>
                      <td>
                        {program.degree.name}
                        <br />
                        <small style={{ color: 'var(--muted)' }}>
                          {ans(program.duration)}
                          {program.evening ? ' · soir' : ''}
                        </small>
                      </td>
                      <td className="num">{fcfa(program.tuition)}</td>
                      <td>
                        {program.status === 'published' ? (
                          <span className="badge ok">Publiée</span>
                        ) : (
                          <span className="badge wait">Brouillon</span>
                        )}
                      </td>
                      <td>
                        <div className="acts">
                          <Link
                            className="act"
                            to={`${ROUTES.formations}/${program.id}`}
                            title="Modifier"
                            aria-label={`Modifier ${program.name}`}
                          >
                            <Icon name="pencil" />
                          </Link>
                          <button
                            className="act del"
                            type="button"
                            title="Supprimer"
                            aria-label={`Supprimer ${program.name}`}
                            onClick={() => setToDelete(program)}
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
          (routes /admin/formations/nouvelle et /admin/formations/:id). */}
      <Outlet context={{ reloadList: reload }} />

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cette formation ?"
          body={`« ${toDelete.name} » disparaîtra du site public. Cette action est définitive.`}
          onConfirm={onDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

export default ListeFormations
