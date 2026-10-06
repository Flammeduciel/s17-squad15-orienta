// Valeurs, contrôles et envoi du formulaire institut (champs de InstituteInput dans docs/openapi.yaml).

export const EMPTY = {
  name: '',
  short_name: '',
  district: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  accreditation_number: '',
  registration_fee: '50000',
  registration_deadline: '',
  start_date: '',
  description: '',
  benefits: '',
};

// Valeurs du formulaire à partir d'un institut reçu de l'API (InstituteDetail).
export function toValues(institute) {
  return {
    name: institute.name,
    short_name: institute.short_name,
    district: institute.district,
    address: institute.address ?? '',
    phone: institute.phone ?? '',
    whatsapp: institute.whatsapp ?? '',
    email: institute.email ?? '',
    accreditation_number: institute.accreditation_number ?? '',
    registration_fee: String(institute.registration_fee),
    registration_deadline: institute.registration_deadline ?? '',
    start_date: institute.start_date ?? '',
    description: institute.description ?? '',
    benefits: institute.benefits.join('\n'),
  };
}

// Pour comparer des noms : sans accents ni majuscules.
const plain = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Contrôles faits avant l'envoi. `others` : les autres instituts, pour repérer un nom ou un sigle déjà pris.
// Renvoie { champ: message } ; vide si tout est correct.
export function validate(values, others) {
  const errors = {};
  const name = values.name.trim();
  const shortName = values.short_name.trim().toUpperCase();
  const whatsapp = values.whatsapp.replace(/\D/g, '');

  if (!name) errors.name = 'Le nom complet est obligatoire.';
  else if (others.some((o) => plain(o.name) === plain(name))) errors.name = 'Cet institut est déjà au catalogue.';

  if (!shortName) errors.short_name = 'Le sigle est obligatoire.';
  else {
    const taken = others.find((o) => o.short_name.toUpperCase() === shortName);
    if (taken) errors.short_name = `Le sigle « ${shortName} » est déjà utilisé par ${taken.name}.`;
  }

  if (!values.address.trim()) errors.address = "L'adresse est obligatoire.";
  if (!values.phone.trim()) errors.phone = 'Le téléphone est obligatoire.';
  if (whatsapp.length < 8) errors.whatsapp = 'Le numéro WhatsApp est incomplet.';
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Cette adresse électronique est incomplète.';
  }

  const fee = Number(values.registration_fee);
  if (values.registration_fee === '' || !Number.isInteger(fee) || fee < 0) {
    errors.registration_fee = "Les frais d'inscription doivent être un montant entier, en FCFA.";
  }

  // Une rentrée avant la clôture des inscriptions n'a pas de sens.
  const { registration_deadline: deadline, start_date: start } = values;
  if (deadline && start && start < deadline) {
    errors.start_date = `La rentrée (${start}) est antérieure à la clôture des inscriptions (${deadline}).`;
  }
  return errors;
}

// Corps de la requête : les champs vides deviennent null, les avantages une liste (un par ligne).
// `imageUrl` : adresse de l'image à enregistrer, ou null ; `color` : couleur déjà attribuée (modification).
export function toPayload(values, imageUrl, color) {
  const text = (value) => value.trim() || null;
  const payload = {
    name: values.name.trim(),
    short_name: values.short_name.trim().toUpperCase(),
    district: values.district,
    address: values.address.trim(),
    phone: values.phone.trim(),
    whatsapp: values.whatsapp.replace(/\D/g, ''),
    email: text(values.email),
    image_url: imageUrl,
    description: text(values.description),
    benefits: values.benefits
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    registration_fee: Number(values.registration_fee),
    registration_deadline: text(values.registration_deadline),
    start_date: text(values.start_date),
    accreditation_number: text(values.accreditation_number),
  };
  if (color) payload.color = color;
  return payload;
}

// ---------------------------------------------------------------- Image de l'institut
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Vérifie un fichier choisi avant tout envoi : renvoie le message d'erreur, ou null s'il est accepté.
export function imageError(file) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Format non accepté : utilisez JPEG, PNG ou WebP.';
  if (file.size > MAX_IMAGE_SIZE) return 'Image trop lourde : 2 Mo maximum.';
  return null;
}
