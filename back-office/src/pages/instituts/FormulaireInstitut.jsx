/* Formulaire institut - routes /admin/instituts/nouveau et /admin/instituts/:id (ticket P17).
   Champs de la maquette template/back-office.html, affichés dans une fenêtre. */
import { useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  createInstitute,
  getDistricts,
  getInstitute,
  getPrograms,
  updateInstitute,
  uploadImage,
} from '../../api/catalogue';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PageState from '../../components/PageState';
import { useToast } from '../../context/toast-context';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { errorMessage, fcfa, imageUrl } from '../../utils/format';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Valeurs de départ du formulaire : celles de l'institut, ou un formulaire vide.
function toForm(institute) {
  return {
    name: institute?.name ?? '',
    short_name: institute?.short_name ?? '',
    district_id: institute?.district_id ?? '',
    address: institute?.address ?? '',
    phone: institute?.phone ?? '',
    whatsapp: institute?.whatsapp ?? '',
    email: institute?.email ?? '',
    accreditation_number: institute?.accreditation_number ?? '',
    registration_fee: institute?.registration_fee ?? 50000,
    registration_deadline: institute?.registration_deadline ?? '',
    start_date: institute?.start_date ?? '',
    description: institute?.description ?? '',
    benefits: (institute?.benefits ?? []).join('\n'),
    image_url: institute?.image_url ?? null,
    banner_url: institute?.banner_url ?? null,
  };
}

// Contrôles faits avant l'envoi. Renvoie { champ: message } ; vide si tout est bon.
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Le nom complet est obligatoire.';
  if (!form.short_name.trim()) errors.short_name = 'Le sigle est obligatoire.';
  if (!form.address.trim()) errors.address = "L'adresse est obligatoire.";
  if (!form.phone.trim()) errors.phone = 'Le téléphone est obligatoire.';
  if (form.whatsapp.replace(/\D/g, '').length < 8) errors.whatsapp = 'Le numéro WhatsApp est incomplet.';
  if (form.email && !form.email.includes('@')) errors.email = 'Cette adresse électronique est incomplète.';
  // Une rentrée avant la clôture des inscriptions n'a pas de sens.
  if (form.registration_deadline && form.start_date && form.start_date < form.registration_deadline) {
    errors.start_date = 'La rentrée est antérieure à la clôture des inscriptions.';
  }
  return errors;
}

// Champ d'image du formulaire : aperçu, bouton pour choisir un fichier, bouton
// pour retirer l'image. wide : aperçu en largeur, pour la bannière.
function ImageField({ label, hint, url, placeholder, color, wide, onPick, onRemove }) {
  const fileInput = useRef(null);

  const onChange = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (file) onPick(file);
  };

  return (
    <div className="fld" style={{ marginTop: 16 }}>
      <label>{label}</label>
      <div className="logoedit" role="group" aria-label={label}>
        <div className={`ap${wide ? ' wide' : ''}`} style={{ background: url ? '#fff' : (color ?? '#5E6B64') }}>
          {url ? <img src={imageUrl(url)} alt={`Aperçu : ${label}`} /> : placeholder}
        </div>
        <div className="cmd">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn line sm" type="button" onClick={() => fileInput.current.click()}>
              <Icon name="upload" />
              {url ? "Changer l'image" : 'Choisir une image'}
            </button>
            {url && (
              <button className="btn ghost sm" type="button" onClick={onRemove}>
                Retirer
              </button>
            )}
          </div>
          <span className="hint">{hint}</span>
        </div>
      </div>
      <input type="file" accept={IMAGE_TYPES.join(',')} hidden ref={fileInput} onChange={onChange} />
    </div>
  );
}

function InstituteForm({ institute, districts, linked, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    ...toForm(institute),
    district_id: institute?.district_id ?? districts[0].id,
  }));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // Un champ du formulaire, avec son message d'erreur éventuel.
  const field = (name, label, props = {}, hint) => (
    <div className={`fld${errors[name] ? ' bad' : ''}`}>
      <label htmlFor={`i-${name}`}>{label}</label>
      <input id={`i-${name}`} name={name} value={form[name]} onChange={onChange} {...props} />
      {hint && <span className="hint">{hint}</span>}
      {errors[name] && <span className="err">{errors[name]}</span>}
    </div>
  );

  // Une image est déposée dès qu'elle est choisie ; son adresse part avec le reste
  // à l'enregistrement. key : 'image_url' (cartes) ou 'banner_url' (bannière).
  const onImage = async (key, file) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast('Format non accepté : utilisez JPEG, PNG ou WebP.', true);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast('Image trop lourde : 2 Mo maximum.', true);
      return;
    }
    try {
      const { url } = await uploadImage(file);
      setForm((current) => ({ ...current, [key]: url }));
      toast("Image prête. Enregistrez la fiche pour l'appliquer.");
    } catch (err) {
      toast(errorMessage(err), true);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    const found = validate(form);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count > 0) {
      toast(`${count} erreur${count > 1 ? 's' : ''} dans le formulaire.`, true);
      return;
    }
    const body = {
      name: form.name.trim(),
      short_name: form.short_name.trim().toUpperCase(),
      district_id: form.district_id,
      address: form.address.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ''),
      email: form.email.trim() || null,
      image_url: form.image_url,
      banner_url: form.banner_url,
      description: form.description.trim() || null,
      benefits: form.benefits
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      registration_fee: Number(form.registration_fee) || 0,
      registration_deadline: form.registration_deadline || null,
      start_date: form.start_date || null,
      accreditation_number: form.accreditation_number.trim() || null,
    };
    setSubmitting(true);
    try {
      if (institute) {
        await updateInstitute(institute.id, body);
        toast('Institut mis à jour.');
      } else {
        await createInstitute(body);
        toast('Institut ajouté au catalogue.');
      }
      onSaved();
    } catch (err) {
      // Nom ou sigle déjà pris (409), champ refusé (400) : l'API dit pourquoi.
      setApiError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={institute ? `Modifier ${institute.short_name}` : 'Ajouter un institut'}
      subtitle={
        institute
          ? 'La fiche publique reprend ces informations.'
          : 'Un institut doit être rattaché à un arrondissement.'
      }
      onClose={onClose}
    >
      <form className="form" onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend>Identité</legend>
          <div className="row two">
            {field('name', 'Nom complet', {
              placeholder: 'ex. Institut Supérieur de Gestion du Fleuve',
            })}
            {field('short_name', 'Sigle', {
              placeholder: 'ex. ISGF',
              maxLength: 12,
            })}
          </div>
          <div className="row two" style={{ marginTop: 16 }}>
            <div className="fld">
              <label htmlFor="i-district">Arrondissement</label>
              <select id="i-district" name="district_id" value={form.district_id} onChange={onChange}>
                {districts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.city})
                  </option>
                ))}
              </select>
            </div>
            {field('address', 'Adresse', { placeholder: 'Avenue …, quartier' })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Contact</legend>
          <div className="row two">
            {field('phone', 'Téléphone', {
              placeholder: '+242 …',
              inputMode: 'tel',
            })}
            {field(
              'whatsapp',
              'WhatsApp',
              { placeholder: '24206…', inputMode: 'numeric' },
              'Format international, sans le +.',
            )}
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            {field('email', 'Adresse électronique', {
              type: 'email',
              placeholder: 'contact@institut.cg',
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Agrément et frais</legend>
          <div className="row two">
            {field(
              'accreditation_number',
              "Numéro d'agrément",
              { placeholder: 'ex. N° 047/MESRTI/2009' },
              "Laisser vide si l'institut n'est pas agréé : il apparaîtra sans badge.",
            )}
            {field('registration_fee', "Frais d'inscription (FCFA)", {
              type: 'number',
              min: 0,
              step: 1000,
            })}
          </div>
          <div className="row two" style={{ marginTop: 16 }}>
            {field('registration_deadline', 'Clôture des inscriptions', {
              type: 'date',
            })}
            {field('start_date', 'Rentrée', { type: 'date' })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Présentation et images</legend>
          <div className="fld">
            <label htmlFor="i-description">Description</label>
            <textarea
              id="i-description"
              name="description"
              placeholder="Présentation courte, affichée sur la fiche publique"
              value={form.description}
              onChange={onChange}
            />
          </div>
          <div className="fld" style={{ marginTop: 16 }}>
            <label htmlFor="i-benefits">Avantages (optionnel)</label>
            <textarea
              id="i-benefits"
              name="benefits"
              placeholder="Un avantage par ligne : bibliothèque, bourses, restauration…"
              value={form.benefits}
              onChange={onChange}
            />
          </div>
          <ImageField
            label="Image des cartes"
            hint="JPEG, PNG ou WebP, 2 Mo maximum. Affichée sur les cartes de l'institut, dans les listes du site public."
            url={form.image_url}
            placeholder={form.short_name || 'IMAGE'}
            color={institute?.color}
            onPick={(file) => onImage('image_url', file)}
            onRemove={() => setForm({ ...form, image_url: null })}
          />
          <ImageField
            wide
            label="Bannière de la fiche"
            hint="Grande image en largeur, affichée en haut de la fiche publique de l'institut. Sans bannière, l'image des cartes est utilisée."
            url={form.banner_url}
            placeholder="BANNIÈRE"
            color={institute?.color}
            onPick={(file) => onImage('banner_url', file)}
            onRemove={() => setForm({ ...form, banner_url: null })}
          />
        </fieldset>

        {apiError && (
          <div className="err" role="alert">
            {apiError}
          </div>
        )}

        <div className="formfoot">
          <button className="btn" type="submit" disabled={submitting}>
            {institute ? 'Enregistrer les modifications' : "Créer l'institut"}
          </button>
          <button className="btn line" type="button" onClick={onClose}>
            Annuler
          </button>
          <span className="sp" style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
            {linked.length > 0 &&
              `Cet institut porte ${linked.length} formation(s) : elles seront retirées du catalogue public s'il est supprimé.`}
          </span>
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
                    <td className="num">{fcfa(program.tuition)}</td>
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
    </Modal>
  );
}

// Route /admin/instituts/nouveau ou /admin/instituts/:id : le formulaire s'ouvre
// dans une fenêtre, par-dessus la liste des instituts. Les données sont chargées
// d'abord, pour que le formulaire parte directement des valeurs de l'institut.
function FormulaireInstitut() {
  const { id } = useParams();
  const navigate = useNavigate();
  // La liste, affichée derrière, fournit de quoi se recharger après un enregistrement.
  const { reloadList } = useOutletContext();
  const { data, loading, error } = useApi(async () => {
    const [districts, programs, institute] = await Promise.all([
      getDistricts(),
      getPrograms(),
      id ? getInstitute(id) : null,
    ]);
    return { districts, programs, institute };
  }, [id]);

  const close = () => navigate(ROUTES.instituts);

  if (!data || loading) {
    return (
      <Modal title={id ? "Modifier l'institut" : 'Ajouter un institut'} onClose={close}>
        <PageState loading={loading} error={error} />
      </Modal>
    );
  }

  if (data.districts.length === 0) {
    return (
      <Modal title="Ajouter un institut" size="medium" onClose={close}>
        <div className="empty">
          <h3>Aucun arrondissement enregistré</h3>
          <p>Un institut est situé dans un arrondissement : créez d'abord une ville et ses arrondissements.</p>
          <Link className="btn line" to={ROUTES.arrondissements}>
            Voir les arrondissements
          </Link>
        </div>
      </Modal>
    );
  }

  const linked = data.institute ? data.programs.filter((program) => program.institute.id === data.institute.id) : [];
  return (
    <InstituteForm
      key={id ?? 'nouveau'}
      institute={data.institute}
      districts={data.districts}
      linked={linked}
      onClose={close}
      onSaved={() => {
        reloadList();
        close();
      }}
    />
  );
}

export default FormulaireInstitut
