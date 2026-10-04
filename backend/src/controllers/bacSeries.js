const httpError = require('../utils/httpError');
const bacSeries = require('../models/bacSeries');

const NOT_FOUND = [404, 'SERIE_INTROUVABLE', 'Aucune série ne correspond à cet identifiant.'];

/** `GET /bac-series` — liste des séries du bac. */
async function listBacSeries(req, res) {
  res.json(await bacSeries.findAll());
}

/** `POST /admin/bac-series` */
async function createBacSeries(req, res) {
  const { code, label } = req.valid.body;
  if (await bacSeries.findByCode(code)) {
    throw httpError(409, 'DEJA_EXISTANT', `La série « ${code} » existe déjà.`);
  }
  res.status(201).json(await bacSeries.create({ code, label }));
}

/** `PUT /admin/bac-series/:id` */
async function updateBacSeries(req, res) {
  const { id } = req.valid.params;
  const { code, label } = req.valid.body;
  const sameCode = await bacSeries.findByCode(code);
  if (sameCode && sameCode.id !== id) {
    throw httpError(409, 'DEJA_EXISTANT', `La série « ${code} » existe déjà.`);
  }
  const series = await bacSeries.update(id, { code, label });
  if (!series) throw httpError(...NOT_FOUND);
  res.json(series);
}

/** `DELETE /admin/bac-series/:id` — refusé tant qu'une formation admet cette série. */
async function deleteBacSeries(req, res) {
  const { id } = req.valid.params;
  const series = await bacSeries.findById(id);
  if (!series) throw httpError(...NOT_FOUND);
  const total = await bacSeries.countPrograms(id);
  if (total > 0) {
    throw httpError(409, 'ELEMENT_UTILISE', `« ${series.code} » est utilisée par ${total} formation(s) : modifiez-les d'abord.`);
  }
  await bacSeries.remove(id);
  res.status(204).end();
}

module.exports = { listBacSeries, createBacSeries, updateBacSeries, deleteBacSeries };
