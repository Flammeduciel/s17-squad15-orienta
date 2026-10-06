// Valeurs, contrôles et envoi du formulaire formation (champs de ProgramInput dans
// docs/openapi.yaml). Les diplômes, séries et débouchés sont choisis dans les
// référentiels : ils ne sont jamais créés à la volée.

export const EMPTY = {
  name: '',
  institute_id: '',
  domain_id: '',
  degree_id: '',
  description: '',
  admission_requirements: '',
  internship_months: '0',
  evening: false,
  installments: false,
  status: 'published',
  series_ids: [],
  career_ids: [],
  fees: [],
};

// Valeurs du formulaire à partir d'une formation reçue de l'API (ProgramDetail).
// Les codes des séries et les noms des débouchés sont ramenés aux identifiants du
// référentiel chargé ; une entrée absente du référentiel ne peut pas être reprise.
export function toValues(program, series, careers) {
  return {
    name: program.name,
    institute_id: String(program.institute.id),
    domain_id: program.domain.id,
    degree_id: String(program.degree.id),
    description: program.description ?? '',
    admission_requirements: program.admission_requirements ?? '',
    internship_months: String(program.internship_months),
    evening: program.evening,
    installments: program.installments,
    status: program.status,
    series_ids: program.bac_series
      .map((code) => series.find((item) => item.code === code)?.id)
      .filter(Number.isInteger),
    career_ids: program.careers
      .map((name) => careers.find((item) => item.name === name)?.id)
      .filter(Number.isInteger),
    fees: program.fees.map((fee) => String(fee.amount)),
  };
}

// Contrôles faits avant l'envoi. Renvoie { champ: message } ; vide si tout est correct.
export function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "L'intitulé de la filière est obligatoire.";
  if (!values.institute_id) errors.institute_id = "Choisissez l'institut qui porte la formation.";
  if (!values.domain_id) errors.domain_id = 'Choisissez le domaine.';
  if (!values.degree_id) errors.degree_id = 'Choisissez le diplôme délivré.';

  const fees = values.fees.map(Number);
  if (fees.length === 0) errors.fees = 'Renseignez les frais de chaque année.';
  else if (fees.some((fee) => !Number.isInteger(fee) || fee < 1)) {
    errors.fees = 'Les frais doivent être des montants entiers, en FCFA.';
  }

  const stage = Number(values.internship_months);
  if (!Number.isInteger(stage) || stage < 0 || stage > 12) {
    errors.internship_months = 'Le stage est en mois, entre 0 et 12.';
  }

  if (values.career_ids.length === 0) errors.career_ids = 'Cochez au moins un débouché.';
  return errors;
}

// Corps de la requête : les champs vides deviennent null, les montants des nombres.
export function toPayload(values) {
  const text = (value) => value.trim() || null;
  return {
    name: values.name.trim(),
    institute_id: Number(values.institute_id),
    domain_id: values.domain_id,
    degree_id: Number(values.degree_id),
    description: text(values.description),
    admission_requirements: text(values.admission_requirements),
    fees: values.fees.map((fee) => Number(fee)),
    bac_series_ids: values.series_ids,
    career_ids: values.career_ids.map(Number),
    evening: values.evening,
    internship_months: Number(values.internship_months),
    installments: values.installments,
    status: values.status,
  };
}