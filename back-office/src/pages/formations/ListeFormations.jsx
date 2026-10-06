import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, request } from '../../api/http';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Pagination from '../../components/Pagination';
import Status from '../../components/Status';
import { useToast } from '../../context/toast-context';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { formatDuration, formatFcfa, plural } from '../../utils/format';

/* Liste des formations — route /admin/formations (ticket P14).
   Brouillons compris. Maquette : template/back-office.html. */

const PER_PAGE = 10;

const STATUTS = [
  { value: '', label: 'Tous' },
  { value: 'published', label: 'Publiées' },
  { value: 'draft', label: 'Brouillons' },
];

// Pour la recherche : sans accents ni majuscules.
const plain = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const NO_FILTER = { q: '', domaine: '', statut: '' };

function ListeFormations() {
  const toast = useToast();
  const programs = useFetch('/admin/programs');
  const domaines = useFetch('/domains').data ?? [];

  const [filters, setFilters] = useState(NO_FILTER);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function filter(patch) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  async function remove() {
    setDeleting(true);
    try {
      await request(`/admin/programs/${toDelete.id}`, { method: 'DELETE' });
      toast('Formation supprimée.');
      setToDelete(null);
      programs.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    } finally {
      setDeleting(false);
    }
  }

  const all = programs.data?.items ?? [];
  const brouillons = all.filter((program) => program.status === 'draft').length;
  const words = plain(filters.q).split(/\s+/).filter(Boolean);
  const rows = all
    .filter((program) => {
      if (filters.domaine && program.domain.id !== filters.domaine) return false;
      if (filters.statut && program.status !== filters.statut) return false;
      const texte = plain(
        `${program.name} ${program.institute.name} ${program.institute.short_name} ${program.careers.join(' ')}`,
      );
      return words.every((word) => texte.includes(word));
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  // Après une suppression, la dernière page peut avoir disparu.
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  let body;
  if (programs.error) {
    body = (
      <div className="pad">
        <Status error={programs.error} onRetry={programs.reload} />
      </div>
    );
  } else if (!programs.data) {
    body = (
      <div className="pad">
        <Status loading />
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="pad">
        <div className="empty">
          {all.length === 0 ? (
            <>
              <h3>Aucune formation au catalogue</h3>
              <p>Ajoutez la première formation pour commencer.</p>
              <Link className="btn" to={`${ROUTES.formations}/nouvelle`}>
                <Icon name="plus" />
                Ajouter une formation
              </Link>
            </>
          ) : (
            <>
              <h3>Aucune formation ne correspond</h3>
              <p>Modifiez la recherche ou les filtres.</p>
              <button className="btn line" type="button" onClick={() => filter(NO_FILTER)}>
                Réinitialiser les filtres
              </button>
            </>
          )}
        </div>
      </div>
    );
  } else {
    body = (
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
                    <div className="who">
                      <span>
                        <b>{program.institute.short_name}</b>
                        <small>{program.institute.district}</small>
                      </span>
                    </div>
                  </td>
                  <td>{program.domain.name}</td>
                  <td>
                    <div className="who">
                      <span>
                        <b>{program.degree.name}</b>
                        <small>
                          {formatDuration(program.duration)}
                          {program.evening ? ' · soir' : ''}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className="num">{formatFcfa(program.tuition)}</td>
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
        <Pagination total={rows.length} page={current} perPage={PER_PAGE} onPage={setPage} />
      </>
    );
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Formations</h1>
          <p>
            {all.length > 0
              ? `${plural(all.length, 'formation')} au catalogue, dont ${plural(brouillons, 'brouillon')}.`
              : 'Aucune formation au catalogue.'}
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
                value={filters.q}
                onChange={(e) => filter({ q: e.target.value })}
              />
            </span>
            <select
              className="field"
              aria-label="Filtrer par domaine"
              value={filters.domaine}
              onChange={(e) => filter({ domaine: e.target.value })}
            >
              <option value="">Tous les domaines</option>
              {domaines.map((domaine) => (
                <option key={domaine.id} value={domaine.id}>
                  {domaine.name}
                </option>
              ))}
            </select>
            <div className="seg" role="group" aria-label="Filtrer par statut">
              {STATUTS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  aria-pressed={filters.statut === option.value}
                  onClick={() => filter({ statut: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <small>{programs.data ? `${rows.length} résultat${rows.length > 1 ? 's' : ''}` : ''}</small>
        </header>
        {body}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cette formation ?"
          message={`« ${toDelete.name} » ainsi que ses cours seront retirés. Cette action est définitive.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

export default ListeFormations;