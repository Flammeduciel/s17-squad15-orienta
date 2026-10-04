/* Cours — route /admin/cours (ticket P19).
   Maquette : template/back-office.html. */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createCourse,
  deleteCourse,
  getCourses,
  getPrograms,
  linkCourse,
  unlinkCourse,
  updateCourse,
} from '../../api/catalogue';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PageState from '../../components/PageState';
import Pager from '../../components/Pager';
import { useToast } from '../../context/toast-context';
import { useApi } from '../../hooks/useApi';
import { errorMessage, matches, niveau, pageOf } from '../../utils/format';

const PER_PAGE = 10;

// Libellé d'une formation dans les listes : « Sage-femme — ISD ».
const programLabel = (program) => `${program.name} — ${program.institute.short_name}`;

function Cours() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(async () => {
    const [courses, programs] = await Promise.all([getCourses(), getPrograms()]);
    programs.sort((a, b) => programLabel(a).localeCompare(programLabel(b), 'fr'));
    return { courses, programs };
  }, []);
  // L'adresse garde la formation filtrée : /admin/cours?formation=12.
  // « ajout=1 » ouvre d'emblée le formulaire (arrivée depuis une formation neuve).
  const [params, setParams] = useSearchParams();
  const programId = Number(params.get('formation')) || null;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // editing : null (liste seule), 'new' (ajout) ou le cours en cours de modification.
  const [editing, setEditing] = useState(params.get('ajout') ? 'new' : null);
  const [name, setName] = useState('');
  // links : formations rattachées au cours du formulaire, [{ program_id, year }].
  const [links, setLinks] = useState(programId ? [{ program_id: programId, year: 1 }] : []);
  const [formError, setFormError] = useState('');
  const [attach, setAttach] = useState({ courseId: '', year: 1 });
  const [toDelete, setToDelete] = useState(null);

  if (!data) return <PageState loading={loading} error={error} />;

  const { courses, programs } = data;
  const program = programs.find((item) => item.id === programId) ?? null;
  const durationOf = (id) => programs.find((item) => item.id === id)?.duration ?? 1;
  // Rattachement d'un cours à la formation filtrée, s'il existe.
  const linkOf = (course) => course.programs.find((item) => item.program_id === programId);

  const rows = courses
    .filter((course) => (!program || linkOf(course)) && matches(search, course.name))
    .sort((a, b) => (program ? linkOf(a).year - linkOf(b).year : 0) || a.name.localeCompare(b.name, 'fr'));
  const visible = pageOf(rows, page, PER_PAGE);
  // Cours du catalogue pas encore rattachés à la formation filtrée.
  const free = program ? courses.filter((course) => !linkOf(course)) : [];

  const setFilter = (id) => {
    setParams(id ? { formation: id } : {});
    setPage(1);
  };

  const startAdd = () => {
    setName('');
    setLinks(program ? [{ program_id: program.id, year: 1 }] : []);
    setFormError('');
    setEditing('new');
  };
  const startEdit = (course) => {
    setName(course.name);
    setLinks(
      course.programs.map((item) => ({
        program_id: item.program_id,
        year: item.year,
      })),
    );
    setFormError('');
    setEditing(course);
  };

  // --- Lignes « formation + année » du formulaire
  const addLink = () => {
    const unused = programs.find((item) => !links.some((link) => link.program_id === item.id));
    if (!unused) {
      toast('Ce cours est déjà rattaché à toutes les formations.', true);
      return;
    }
    setLinks([...links, { program_id: unused.id, year: 1 }]);
  };
  const changeLink = (index, patch) => {
    const next = links.map((link, position) => (position === index ? { ...link, ...patch } : link));
    // Si on change de formation, l'année ne doit pas dépasser la durée de son diplôme.
    next[index].year = Math.min(next[index].year, durationOf(next[index].program_id));
    setLinks(next);
  };
  const removeLink = (index) => setLinks(links.filter((_, position) => position !== index));

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const cleanName = name.trim();
    if (!cleanName) {
      setFormError("L'intitulé est obligatoire.");
      return;
    }
    const body = { name: cleanName, programs: links };
    try {
      if (editing === 'new') {
        await createCourse(body);
        toast(
          `« ${cleanName} » ajouté${links.length ? ` et rattaché à ${links.length} formation(s)` : ' au catalogue'}.`,
        );
        // Le formulaire reste ouvert sur les mêmes formations, pour enchaîner les cours.
        setName('');
      } else {
        await updateCourse(editing.id, body);
        toast('Cours mis à jour.');
        setEditing(null);
      }
      reload();
    } catch (err) {
      // Intitulé déjà au catalogue (409), formation rattachée deux fois (400)… l'API dit pourquoi.
      setFormError(errorMessage(err));
    }
  };

  // --- Actions sur la formation filtrée
  const onAttach = async () => {
    const course = courses.find((item) => item.id === Number(attach.courseId || free[0]?.id));
    if (!course) return;
    try {
      await linkCourse(program.id, course.id, Math.min(attach.year, program.duration));
      toast(`« ${course.name} » rattaché à « ${program.name} ».`);
      setAttach({ courseId: '', year: attach.year });
      reload();
    } catch (err) {
      toast(errorMessage(err), true);
    }
  };
  const onDetach = async (course) => {
    try {
      await unlinkCourse(program.id, course.id);
      toast(`« ${course.name} » retiré de cette formation. Il reste au catalogue.`);
      reload();
    } catch (err) {
      toast(errorMessage(err), true);
    }
  };

  const onDelete = async () => {
    const course = toDelete;
    setToDelete(null);
    try {
      await deleteCourse(course.id);
      toast(`Cours « ${course.name} » supprimé du catalogue.`);
      if (editing?.id === course.id) setEditing(null);
      reload();
    } catch (err) {
      toast(errorMessage(err), true);
    }
  };

  const yearOptions = (id) =>
    Array.from({ length: durationOf(id) }, (_, index) => (
      <option key={index} value={index + 1}>
        {niveau(index + 1)}
      </option>
    ));

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Cours</h1>
          <p>
            {courses.length} cours au catalogue. Un même cours peut être rattaché à plusieurs formations, chacune avec
            son année d'études.
          </p>
        </div>
        <button className="btn" type="button" onClick={startAdd}>
          <Icon name="plus" />
          Ajouter un cours
        </button>
      </div>

      {/* L'ajout et la modification se font dans une fenêtre, par-dessus la liste. */}
      {editing && (
        <Modal title={editing === 'new' ? 'Ajouter un cours' : 'Modifier le cours'} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={onSubmit} noValidate>
            <fieldset>
              <legend>Cours et formations</legend>
              <div className="row">
                <div className={`fld${formError ? ' bad' : ''}`}>
                  <label htmlFor="c-nom">Intitulé du cours</label>
                  <input
                    id="c-nom"
                    autoFocus
                    placeholder="ex. Français"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  {formError && (
                    <span className="err" role="alert">
                      {formError}
                    </span>
                  )}
                </div>
              </div>
              <div className="row" style={{ marginTop: 16 }}>
                <div className="fld">
                  <label>Formations rattachées</label>
                  <div>
                    {links.map((link, index) => (
                      <div className="lien" key={index}>
                        <select
                          className="lien-forme"
                          aria-label="Formation"
                          value={link.program_id}
                          onChange={(event) =>
                            changeLink(index, {
                              program_id: Number(event.target.value),
                            })
                          }
                        >
                          {programs.map((item) => (
                            <option key={item.id} value={item.id}>
                              {programLabel(item)} ({item.degree.name})
                            </option>
                          ))}
                        </select>
                        <select
                          className="lien-annee"
                          aria-label="Année d'études"
                          value={link.year}
                          onChange={(event) =>
                            changeLink(index, {
                              year: Number(event.target.value),
                            })
                          }
                        >
                          {yearOptions(link.program_id)}
                        </select>
                        <button
                          className="act del"
                          type="button"
                          title="Retirer cette formation"
                          aria-label="Retirer cette formation"
                          onClick={() => removeLink(index)}
                        >
                          <Icon name="x" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {programs.length > 0 && (
                    <button className="btn line sm" type="button" onClick={addLink}>
                      <Icon name="plus" />
                      Rattacher à une formation
                    </button>
                  )}
                  <span className="hint" style={{ display: 'block' }}>
                    Les années proposées viennent du diplôme de chaque formation. Un cours sans formation reste au
                    catalogue.
                  </span>
                </div>
              </div>
            </fieldset>
            <div className="formfoot">
              <button className="btn" type="submit">
                {editing === 'new' ? 'Ajouter le cours' : 'Enregistrer les modifications'}
              </button>
              <button className="btn line" type="button" onClick={() => setEditing(null)}>
                {editing === 'new' ? 'Terminer' : 'Annuler'}
              </button>
            </div>
          </form>
        </Modal>
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
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </span>
            <select
              className="field"
              aria-label="Filtrer par formation"
              value={programId ?? ''}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="">Toutes les formations</option>
              {programs.map((item) => (
                <option key={item.id} value={item.id}>
                  {programLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <small>
            {rows.length} résultat{rows.length > 1 ? 's' : ''}
          </small>
        </header>

        {/* Formation filtrée : on peut lui rattacher directement un cours déjà au catalogue. */}
        {program && free.length > 0 && (
          <div className="attach">
            <b style={{ fontSize: 14 }}>Rattacher un cours existant</b>
            <select
              aria-label="Cours à rattacher"
              value={attach.courseId || free[0].id}
              onChange={(event) => setAttach({ ...attach, courseId: event.target.value })}
            >
              {free.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Année d'études"
              style={{ flex: '0 1 150px' }}
              value={Math.min(attach.year, program.duration)}
              onChange={(event) => setAttach({ ...attach, year: Number(event.target.value) })}
            >
              {yearOptions(program.id)}
            </select>
            <button className="btn sm" type="button" onClick={onAttach}>
              <Icon name="plus" />
              Rattacher
            </button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="pad">
            <div className="empty">
              <h3>Aucun cours</h3>
              <p>
                {program && !search
                  ? "Cette formation n'a pas encore de cours : rattachez-en un ou ajoutez-en un nouveau."
                  : 'Modifiez la recherche ou le filtre.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>{program ? 'Année' : 'Formations rattachées'}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((course) => {
                    const count = course.programs.length;
                    return (
                      <tr key={course.id}>
                        <td>
                          <b>{course.name}</b>
                        </td>
                        {program ? (
                          <td>
                            {niveau(linkOf(course).year)}
                            {count > 1 && (
                              <>
                                <br />
                                <small style={{ color: 'var(--muted)' }}>
                                  aussi dans {count - 1} autre
                                  {count > 2 ? 's' : ''} formation
                                  {count > 2 ? 's' : ''}
                                </small>
                              </>
                            )}
                          </td>
                        ) : (
                          <td>
                            {count === 0 ? (
                              <span className="badge wait">Aucune</span>
                            ) : (
                              <>
                                <span className={`badge ${count > 1 ? 'ok' : 'wait'}`}>
                                  {count} formation{count > 1 ? 's' : ''}
                                </span>
                                <br />
                                <small style={{ color: 'var(--muted)' }}>
                                  {course.programs
                                    .slice(0, 2)
                                    .map((item) => `${item.program_name} — ${item.institute_short_name}`)
                                    .join(' · ')}
                                  {count > 2 ? ' …' : ''}
                                </small>
                              </>
                            )}
                          </td>
                        )}
                        <td>
                          <div className="acts">
                            {program && (
                              <button
                                className="act"
                                type="button"
                                title="Retirer de cette formation"
                                aria-label={`Retirer ${course.name} de cette formation`}
                                onClick={() => onDetach(course)}
                              >
                                <Icon name="x" />
                              </button>
                            )}
                            <button
                              className="act"
                              type="button"
                              title="Modifier"
                              aria-label={`Modifier ${course.name}`}
                              onClick={() => startEdit(course)}
                            >
                              <Icon name="pencil" />
                            </button>
                            <button
                              className="act del"
                              type="button"
                              title="Supprimer du catalogue"
                              aria-label={`Supprimer ${course.name}`}
                              onClick={() => setToDelete(course)}
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
            <Pager total={rows.length} perPage={PER_PAGE} page={page} onPage={setPage} />
          </>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce cours ?"
          body={`« ${toDelete.name} » sera supprimé du catalogue${
            toDelete.programs.length ? ` et retiré du programme de ${toDelete.programs.length} formation(s)` : ''
          }. Cette action est définitive.`}
          onConfirm={onDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}

export default Cours
