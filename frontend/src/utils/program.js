// Libellés des tarifs et des conditions d'admission d'une formation (tableau de la fiche institut,
// fiche formation). `program` a la forme ProgramSummary du contrat.

// 1 -> « 1re année », 2 -> « 2e année ».
export function yearLabel(year) {
  return year === 1 ? '1re année' : `${year}e année`;
}

// Un montant par année quand les tarifs diffèrent d'un niveau à l'autre, sinon le seul montant à payer.
// Renvoie une liste de { label, amount } : `label` est vide quand il n'y a qu'un tarif.
export function feeLines(program) {
  const different = new Set(program.fees.map((fee) => fee.amount)).size > 1;
  if (!different) return [{ label: '', amount: program.tuition }];
  return program.fees.map((fee) => ({ label: yearLabel(fee.year), amount: fee.amount }));
}

// « Bac séries C, D · Étude de dossier et entretien ». Sans série rattachée, la formation est ouverte
// à toutes les séries, sauf un Master, qui suit une licence.
export function admissionText(program) {
  const { bac_series: series, degree, admission_requirements: requirements } = program;
  let access;
  if (series.length > 0) access = `Bac série${series.length > 1 ? 's' : ''} ${series.join(', ')}`;
  else access = degree.name === 'Master' ? 'Licence dans le domaine' : 'Bac toutes séries';
  return [access, requirements].filter(Boolean).join(' · ');
}
