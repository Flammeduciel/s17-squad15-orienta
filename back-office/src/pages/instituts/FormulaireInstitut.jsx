import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { errorMessage, imageUrl, request } from '../../api/http';
import Icon from '../../components/Icon';
import Status from '../../components/Status';
import { useToast } from '../../context/toast-context';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../routes';
import { formatFcfa, plural } from '../../utils/format';
import { EMPTY, toPayload, toValues, validate } from './formulaire';
import ImageInstitut from './ImageInstitut';

/* Formulaire institut — routes /admin/instituts/nouveau et /admin/instituts/:id (ticket P17).
   Maquette : template/back-office.html. */

// Couleur de l'aperçu quand l'institut n'a pas encore de couleur attribuée (création).
const DEFAULT_COLOR = '#5E6B64';

// Champ de formulaire : étiquette, saisie, aide et message d'erreur. Le reste des attributs va à la saisie.
function Field({ id, label, hint, error, as: Input = 'input', ...props }) {
  return (
    <div className={`fld${error ? ' bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {hint && <span className="hint">{hint}</span>}
      {error && (
        <span className="err" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}

function Formulaire({ institute, linked, others, districts }) {
  const toast = useToast();
  const navigate = useNavigate();
  const editing = Boolean(institute);

  const [values, setValues] = useState(() =>
    institute ? toValues(institute) : { ...EMPTY, district: districts[0]?.name ?? '' },
  );
  const [errors, setErrors] = useState({});
  // Nouvelle image choisie ({ file, url } : `url` est un aperçu local), envoyée à l'enregistrement.
  const [picked, setPicked] = useState(null);
  const [removed, setRemoved] = useState(false); // l'image enregistrée sera retirée
  const [saving, setSaving] = useState(false);

  // L'aperçu local est libéré quand l'image change ou que la page se ferme.
  useEffect(() => () => picked && URL.revokeObjectURL(picked.url), [picked]);

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    const found = validate(values, others);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count > 0) {
      toast(`${plural(count, 'erreur')} dans le formulaire.`, true);
      document.querySelector('.fld.bad')?.scrollIntoView?.({ block: 'center' });
      return;
    }

    setSaving(true);
    try {
      // L'image part d'abord : l'institut n'est enregistré qu'avec une adresse d'image valide.
      let image = removed ? null : (institute?.image_url ?? null);
      if (picked) {
        const body = new FormData();
        body.append('file', picked.file);
        image = (await request('/admin/images', { method: 'POST', body })).url;
      }
      const payload = toPayload(values, image, institute?.color);
      if (editing) await request(`/admin/institutes/${institute.id}`, { method: 'PUT', body: payload });
      else await request('/admin/institutes', { method: 'POST', body: payload });
      toast(editing ? 'Institut mis à jour.' : 'Institut ajouté au catalogue.');
      navigate(ROUTES.instituts);
    } catch (error) {
      toast(errorMessage(error), true);
      setSaving(false);
    }
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <Link className="btn ghost sm" to={ROUTES.instituts}>
            <Icon name="back" />
            Retour à la liste
          </Link>
          <h1>{editing ? `Modifier ${institute.short_name}` : 'Ajouter un institut'}</h1>
          <p>
            {editing
              ? 'La fiche publique reprend ces informations.'
              : 'Un institut doit être rattaché à un arrondissement de Brazzaville.'}
          </p>
        </div>
        {linked.length > 0 && <span className="badge ok">{plural(linked.length, 'formation')} rattachée{linked.length > 1 ? 's' : ''}</span>}
      </div>

      <form className="form" noValidate onSubmit={submit}>
        <fieldset>
          <legend>Identité</legend>
          <div className="row two">
            <Field id="i-name" label="Nom complet" required value={values.name} onChange={set('name')}
              placeholder="ex. Institut Supérieur de Gestion du Fleuve" error={errors.name} />
            <Field id="i-short" label="Sigle" required value={values.short_name} onChange={set('short_name')}
              placeholder="ex. ISGF" maxLength={20} error={errors.short_name} />
          </div>
          <div className="row two">
            <Field id="i-district" label="Arrondissement" as="select" value={values.district} onChange={set('district')}>
              {districts.map((district) => (
                <option key={district.name}>{district.name}</option>
              ))}
            </Field>
            <Field id="i-address" label="Adresse" required value={values.address} onChange={set('address')}
              placeholder="Avenue …, quartier" error={errors.address} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Contact</legend>
          <div className="row two">
            <Field id="i-phone" label="Téléphone" required value={values.phone} onChange={set('phone')}
              placeholder="+242 …" inputMode="tel" error={errors.phone} />
            <Field id="i-whatsapp" label="WhatsApp" required value={values.whatsapp} onChange={set('whatsapp')}
              placeholder="24206…" inputMode="numeric" hint="Format international, sans le +." error={errors.whatsapp} />
          </div>
          <div className="row">
            <Field id="i-email" label="Adresse électronique" type="email" value={values.email} onChange={set('email')}
              placeholder="contact@institut.cg" error={errors.email} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Agrément et frais</legend>
          <div className="row two">
            <Field id="i-accreditation" label="Numéro d'agrément" value={values.accreditation_number}
              onChange={set('accreditation_number')} placeholder="ex. N° 047/MESRTI/2009"
              hint="Laisser vide si l'institut n'est pas agréé : il apparaîtra sans badge." />
            <Field id="i-fee" label="Frais d'inscription (FCFA)" type="number" min="0" step="1000" required
              value={values.registration_fee} onChange={set('registration_fee')} error={errors.registration_fee} />
          </div>
          <div className="row two">
            <Field id="i-deadline" label="Clôture des inscriptions" type="date" value={values.registration_deadline}
              onChange={set('registration_deadline')} />
            <Field id="i-start" label="Rentrée" type="date" value={values.start_date} onChange={set('start_date')}
              error={errors.start_date} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Présentation et image</legend>
          <Field id="i-description" label="Description" as="textarea" value={values.description}
            onChange={set('description')} placeholder="Présentation courte, affichée sur la fiche publique" />
          <Field id="i-benefits" label="Avantages (optionnel)" as="textarea" value={values.benefits}
            onChange={set('benefits')} placeholder="Un avantage par ligne : bibliothèque, bourses, restauration…" />
          <div className="fld">
            <label id="image-label">Image de l'institut</label>
            <ImageInstitut
              shown={picked ? picked.url : removed ? null : imageUrl(institute?.image_url)}
              sigle={values.short_name.trim().toUpperCase()}
              color={institute?.color ?? DEFAULT_COLOR}
              onPick={(file) => {
                setPicked({ file, url: URL.createObjectURL(file) });
                setRemoved(false);
              }}
              onRemove={() => {
                setPicked(null);
                setRemoved(true);
              }}
              onError={(message) => toast(message, true)}
            />
          </div>
        </fieldset>

        <div className="formfoot">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : "Créer l'institut"}
          </button>
          <Link className="btn line" to={ROUTES.instituts}>
            Annuler
          </Link>
          {linked.length > 0 && (
            <span className="sp">
              Cet institut porte {plural(linked.length, 'formation')} : elles seront retirées du catalogue public s'il
              est supprimé.
            </span>
          )}
        </div>
      </form>

      {linked.length > 0 && (
        <div className="panel">
          <header>
            <h2>Formations rattachées</h2>
          </header>
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Diplôme</th>
                  <th className="num">Frais</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {linked.map((program) => (
                  <tr key={program.id}>
                    <td>
                      <b>{program.name}</b>
                    </td>
                    <td>{program.degree.name}</td>
                    <td className="num">{formatFcfa(program.tuition)}</td>
                    <td>
                      {program.status === 'published' ? (
                        <span className="badge ok">Publiée</span>
                      ) : (
                        <span className="badge wait">Brouillon</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function FormulaireInstitut() {
  const { id } = useParams();
  const editing = id !== undefined;
  // Une adresse qui n'est pas un identifiant (/admin/instituts/abc) ne mène à aucun institut.
  const validId = !editing || /^[1-9]\d*$/.test(id);

  const institute = useFetch(editing && validId ? `/institutes/${id}` : null);
  const everyInstitute = useFetch('/institutes');
  const districts = useFetch('/districts');
  const programs = useFetch(editing && validId ? '/admin/programs' : null);

  if (!validId || institute.error?.status === 404) {
    return (
      <div className="empty">
        <h3>Institut introuvable</h3>
        <p>Cet institut n'existe pas ou a été supprimé.</p>
        <Link className="btn line" to={ROUTES.instituts}>
          Retour à la liste
        </Link>
      </div>
    );
  }

  const failed = [institute, everyInstitute, districts, programs].find((source) => source.error);
  if (failed) return <Status error={failed.error} onRetry={failed.reload} />;
  if (!districts.data || !everyInstitute.data || (editing && (!institute.data || !programs.data))) {
    return <Status loading />;
  }

  const others = everyInstitute.data.items.filter((other) => other.id !== institute.data?.id);
  const linked = editing ? programs.data.items.filter((program) => program.institute.id === institute.data.id) : [];

  return (
    <Formulaire
      key={id ?? 'nouveau'}
      institute={institute.data}
      linked={linked}
      others={others}
      districts={districts.data}
    />
  );
}

export default FormulaireInstitut;
