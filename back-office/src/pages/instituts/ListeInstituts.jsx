import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, imageUrl, request } from '../../api/http';
import AgrementBadge from '../../components/AgrementBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Pagination from '../../components/Pagination';
import Status from '../../components/Status';
import { useToast } from '../../context/toast-context';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { formatFcfa, plural } from '../../utils/format';

/* Liste des instituts — route /admin/instituts (ticket P16).
   Maquette : template/back-office.html. */

const PER_PAGE = 10;

const AGREMENTS = [
  { value: '', label: 'Tous' },
  { value: 'oui', label: 'Agréés' },
  { value: 'non', label: 'Non agréés' },
];

// Pour la recherche : sans accents ni majuscules.
const plain = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const NO_FILTER = { q: '', district: '', agrement: '' };

function ListeInstituts() {
  const toast = useToast();
  const institutes = useFetch('/institutes');
  const districts = useFetch('/districts').data ?? [];
  // Brouillons compris : c'est ce qui permet d'annoncer le vrai nombre de formations emportées.
  const programs = useFetch('/admin/programs');

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
      await request(`/admin/institutes/${toDelete.id}`, { method: 'DELETE' });
      toast('Institut supprimé.');
      setToDelete(null);
      institutes.reload();
      programs.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    } finally {
      setDeleting(false);
    }
  }

  // Formations qui disparaissent avec l'institut. Sans la liste complète, on se rabat sur les formations publiées.
  const programCount = (institute) =>
    programs.data
      ? programs.data.items.filter((program) => program.institute.id === institute.id).length
      : institute.program_count;

  const all = institutes.data?.items ?? [];
  const words = plain(filters.q).split(/\s+/).filter(Boolean);
  const rows = all
    .filter((institute) => {
      if (filters.district && institute.district !== filters.district) return false;
      if (filters.agrement === 'oui' && !institute.accredited) return false;
      if (filters.agrement === 'non' && institute.accredited) return false;
      const text = plain(`${institute.name} ${institute.short_name} ${institute.district}`);
      return words.every((word) => text.includes(word));
    })
    .sort((a, b) => a.short_name.localeCompare(b.short_name, 'fr'));

  // Après une suppression, la dernière page peut avoir disparu.
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  let body;
  if (institutes.error) {
    body = (
      <div className="pad">
        <Status error={institutes.error} onRetry={institutes.reload} />
      </div>
    );
  } else if (!institutes.data) {
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
              <h3>Aucun institut au catalogue</h3>
              <p>Ajoutez le premier institut pour commencer.</p>
              <Link className="btn" to={`${ROUTES.instituts}/nouveau`}>
                <Icon name="plus" />
                Ajouter un institut
              </Link>
            </>
          ) : (
            <>
              <h3>Aucun institut ne correspond</h3>
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
                <th>Institut</th>
                <th>Arrondissement</th>
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
                        {institute.image_url ? <img src={imageUrl(institute.image_url)} alt="" /> : institute.short_name}
                      </span>
                      <span>
                        <b>{institute.name}</b>
                        <small>{institute.short_name}</small>
                      </span>
                    </div>
                  </td>
                  <td>{institute.district}</td>
                  <td>
                    <AgrementBadge institute={institute} />
                  </td>
                  <td className="num">{programCount(institute)}</td>
                  <td className="num">{formatFcfa(institute.registration_fee)}</td>
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
        <Pagination total={rows.length} page={current} perPage={PER_PAGE} onPage={setPage} />
      </>
    );
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Instituts</h1>
          <p>
            {plural(all.length, 'institut')} référencé{all.length > 1 ? 's' : ''} sur les 9 arrondissements de
            Brazzaville.
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
                value={filters.q}
                onChange={(e) => filter({ q: e.target.value })}
              />
            </span>
            <select
              className="field"
              aria-label="Filtrer par arrondissement"
              value={filters.district}
              onChange={(e) => filter({ district: e.target.value })}
            >
              <option value="">Tous les arrondissements</option>
              {districts.map((district) => (
                <option key={district.name}>{district.name}</option>
              ))}
            </select>
            <div className="seg" role="group" aria-label="Filtrer par agrément">
              {AGREMENTS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  aria-pressed={filters.agrement === option.value}
                  onClick={() => filter({ agrement: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <small>{institutes.data ? `${rows.length} résultat${rows.length > 1 ? 's' : ''}` : ''}</small>
        </header>
        {body}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cet institut ?"
          message={`« ${toDelete.name} » sera retiré${
            programCount(toDelete) > 0 ? ` ainsi que ${plural(programCount(toDelete), 'formation')}` : ''
          }. Cette action est définitive.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

export default ListeInstituts;
