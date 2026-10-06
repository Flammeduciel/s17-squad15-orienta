import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage, request } from '../../api/http';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Pagination from '../../components/Pagination';
import Status from '../../components/Status';
import { useToast } from '../../context/toast-context';
import { useFetch } from '../../hooks/useFetch';
import { plural } from '../../utils/format';
import CoursForm from './CoursForm';

/* Cours — route /admin/cours (ticket P19).
   Le filtre « formation » vit dans l'adresse (?formation=12) : la fiche formation y renvoie.
   Maquette : template/back-office.html. */

const PER_PAGE = 10;

// Pour la recherche : sans accents ni majuscules.
const plain = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// (0) → « 1re année », (1) → « 2e année »…
const niveau = (index) => `${index === 0 ? '1re' : `${index + 1}e`} année`;

// Rattachement proposé pour un nouveau cours ouvert depuis le filtre formation.
function liensParDefaut(editingId, formeActive, forme) {
  if (editingId || !formeActive) return [];
  return [{ program_id: forme, year: 1 }];
}

function Cours() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const cours = useFetch('/admin/courses');
  const formations = useFetch('/admin/programs');

  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | { id: integer | null } (null = nouveau cours)
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [attachCours, setAttachCours] = useState('');
  const [attachAnnee, setAttachAnnee] = useState(1);

  const items = useMemo(() => cours.data ?? [], [cours.data]);
  const formationListe = useMemo(() => formations.data?.items ?? [], [formations.data]);
  const filtre = params.get('formation') ?? '';
  // Un filtre sur une formation inconnue est ignoré.
  const formeActive = formationListe.some((formation) => String(formation.id) === filtre) ? filtre : '';
  const forme = Number(formeActive);
  const formationFiltree = formationListe.find((formation) => formation.id === forme);

  const rows = useMemo(() => {
    const needle = plain(q);
    return items
      .filter((coursItem) => !formeActive || coursItem.programs.some((lien) => lien.program_id === forme))
      .filter((coursItem) => !needle || plain(coursItem.name).includes(needle))
      .sort((a, b) => {
        if (formeActive) {
          const ya = a.programs.find((lien) => lien.program_id === forme).year;
          const yb = b.programs.find((lien) => lien.program_id === forme).year;
          if (ya !== yb) return ya - yb;
        }
        return a.name.localeCompare(b.name, 'fr');
      });
  }, [items, q, formeActive, forme]);

  // Cours du catalogue non rattachés à la formation filtrée : rattachable directement.
  const libres = useMemo(
    () =>
      formeActive
        ? items
            .filter((coursItem) => !coursItem.programs.some((lien) => lien.program_id === forme))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        : [],
    [items, formeActive, forme],
  );
  const attachSelection = libres.some((coursItem) => String(coursItem.id) === attachCours)
    ? attachCours
    : (libres[0]?.id.toString() ?? '');
  const dureeFiltree = formationFiltree?.duration ?? 1;

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const pageCourante = Math.min(page, pages);
  const visibles = rows.slice((pageCourante - 1) * PER_PAGE, pageCourante * PER_PAGE);
  const edited = editing?.id ? items.find((coursItem) => coursItem.id === editing.id) : null;

  const setFiltre = (id) => {
    setParams(id ? { formation: id } : {}, { replace: true });
    setPage(1);
  };

  // ---------------------------------------------------------------- Actions

  async function saveCours({ name, programs: liens }) {
    try {
      if (editing?.id) {
        await request(`/admin/courses/${editing.id}`, { method: 'PUT', body: { name, programs: liens } });
        toast('Cours mis à jour.');
      } else {
        await request('/admin/courses', { method: 'POST', body: { name, programs: liens } });
        toast(liens.length > 0 ? `« ${name} » rattaché à ${plural(liens.length, 'formation')}.` : `« ${name} » ajouté au catalogue.`);
      }
      setEditing(null);
      cours.reload();
    } catch (error) {
      toast(errorMessage(error), true);
      throw error; // le formulaire reste ouvert pour corriger
    }
  }

  // Rattacher / retirer = renvoyer la liste complète des rattachements du cours.
  async function rattacher() {
    const coursItem = items.find((coursItem) => String(coursItem.id) === attachSelection);
    if (!coursItem) return;
    try {
      await request(`/admin/courses/${coursItem.id}`, {
        method: 'PUT',
        body: {
          name: coursItem.name,
          programs: [...coursItem.programs.map((lien) => ({ program_id: lien.program_id, year: lien.year })), { program_id: forme, year: attachAnnee }],
        },
      });
      toast(`« ${coursItem.name} » rattaché à « ${formationFiltree.name} ».`);
      cours.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    }
  }

  async function retirer(coursItem) {
    try {
      await request(`/admin/courses/${coursItem.id}`, {
        method: 'PUT',
        body: {
          name: coursItem.name,
          programs: coursItem.programs
            .filter((lien) => lien.program_id !== forme)
            .map((lien) => ({ program_id: lien.program_id, year: lien.year })),
        },
      });
      toast(`« ${coursItem.name} » retiré de cette formation. Il reste au catalogue.`);
      cours.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await request(`/admin/courses/${toDelete.id}`, { method: 'DELETE' });
      toast(`« ${toDelete.name} » supprimé du catalogue.`);
      if (editing?.id === toDelete.id) setEditing(null);
      setToDelete(null);
      cours.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------------- Affichage

  const failed = cours.error || formations.error;
  if (failed) {
    return <Status error={failed} onRetry={cours.error ? cours.reload : formations.reload} />;
  }
  if (!cours.data || !formations.data) {
    return <Status loading />;
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Cours</h1>
          <p>
            {items.length} cours au catalogue. Un même cours peut être rattaché à plusieurs formations, chacune avec son
            année d'études.
          </p>
        </div>
        {!editing && (
          <button
            className="btn"
            type="button"
            onClick={() => {
              setEditing({ id: null });
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="plus" />
            Ajouter un cours
          </button>
        )}
      </div>

      {editing && (
        <CoursForm
          key={editing.id ?? 'nouveau'}
          initial={edited}
          formations={formationListe}
          defaultPrograms={liensParDefaut(editing.id, formeActive, forme)}
          onSubmit={saveCours}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="panel">
        <header>
          <div className="toolbar">
            <span className="field">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Rechercher un cours"
                aria-label="Rechercher"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value);
                  setPage(1);
                }}
              />
            </span>
            <select className="field" aria-label="Filtrer par formation" value={formeActive} onChange={(event) => setFiltre(event.target.value)}>
              <option value="">Toutes les formations</option>
              {formationListe
                .slice()
                .sort((a, b) => `${a.name} ${a.institute.short_name}`.localeCompare(`${b.name} ${b.institute.short_name}`, 'fr'))
                .map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.name} — {formation.institute.short_name}
                  </option>
                ))}
            </select>
          </div>
          <small>
            {rows.length} résultat{rows.length > 1 ? 's' : ''}
          </small>
        </header>

        {/* Formation filtrée : on peut lui rattacher directement un cours déjà au catalogue. */}
        {formeActive && libres.length > 0 && (
          <div className="attach">
            <b>Rattacher un cours existant</b>
            <select
              aria-label="Cours à rattacher"
              value={attachSelection}
              onChange={(event) => setAttachCours(event.target.value)}
            >
              {libres.map((coursItem) => (
                <option key={coursItem.id} value={coursItem.id}>
                  {coursItem.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Année d'études pour le rattachement"
              value={Math.min(attachAnnee, dureeFiltree)}
              onChange={(event) => setAttachAnnee(Number(event.target.value))}
            >
              {Array.from({ length: dureeFiltree }, (_, k) => (
                <option key={k + 1} value={k + 1}>
                  {niveau(k)}
                </option>
              ))}
            </select>
            <button className="btn sm" type="button" onClick={rattacher}>
              <Icon name="plus" />
              Rattacher
            </button>
          </div>
        )}

        {visibles.length > 0 ? (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>{formeActive ? 'Année' : 'Formations rattachées'}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((coursItem) => {
                    const line = formeActive ? coursItem.programs.find((lien) => lien.program_id === forme) : null;
                    const noms = coursItem.programs.map((lien) => lien.program_name);
                    return (
                      <tr key={coursItem.id}>
                        <td>
                          <b>{coursItem.name}</b>
                        </td>
                        <td>
                          {line ? (
                            <div className="who">
                              <span>
                                <b>{niveau(line.year - 1)}</b>
                                {coursItem.programs.length > 1 && (
                                  <small>
                                    aussi dans {coursItem.programs.length - 1} autre{coursItem.programs.length > 2 ? 's' : ''}{' '}
                                    formation{coursItem.programs.length > 2 ? 's' : ''}
                                  </small>
                                )}
                              </span>
                            </div>
                          ) : noms.length > 0 ? (
                            <div className="who">
                              <span>
                                <span className={`badge ${noms.length > 1 ? 'ok' : 'wait'}`}>{plural(noms.length, 'formation')}</span>
                                <br />
                                <small>
                                  {noms.slice(0, 2).join(' · ')}
                                  {noms.length > 2 ? ' …' : ''}
                                </small>
                              </span>
                            </div>
                          ) : (
                            <span className="badge wait">Aucune</span>
                          )}
                        </td>
                        <td>
                          <div className="acts">
                            {formeActive && line && (
                              <button
                                className="act"
                                type="button"
                                title="Retirer de cette formation"
                                aria-label={`Retirer ${coursItem.name} de cette formation`}
                                onClick={() => retirer(coursItem)}
                              >
                                <Icon name="x" />
                              </button>
                            )}
                            <button
                              className="act"
                              type="button"
                              title="Modifier"
                              aria-label={`Modifier ${coursItem.name}`}
                              onClick={() => {
                                setEditing({ id: coursItem.id });
                                window.scrollTo(0, 0);
                              }}
                            >
                              <Icon name="pencil" />
                            </button>
                            <button
                              className="act del"
                              type="button"
                              title="Supprimer du catalogue"
                              aria-label={`Supprimer ${coursItem.name}`}
                              onClick={() => setToDelete(coursItem)}
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination total={rows.length} page={pageCourante} perPage={PER_PAGE} onPage={setPage} />
          </>
        ) : (
          <div className="pad">
            <div className="empty">
              <h3>Aucun cours</h3>
              <p>
                {formeActive && !q
                  ? "Cette formation n'a pas encore de cours : rattachez-en un ou ajoutez-en un nouveau."
                  : 'Modifiez la recherche ou le filtre.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce cours ?"
          message={`« ${toDelete.name} » sera supprimé du catalogue${
            toDelete.programs.length
              ? ` et retiré du programme de ${plural(toDelete.programs.length, 'formation')}`
              : ''
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

export default Cours;