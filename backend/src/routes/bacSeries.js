const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { bacSeriesBody } = require('../validators/bacSeries');
const bacSeries = require('../controllers/bacSeries');

/**
 * Routes des séries du bac (bloc BK3).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/bac-series', bacSeries.listBacSeries);
router.post('/admin/bac-series', validate({ body: bacSeriesBody }), bacSeries.createBacSeries);
router.put('/admin/bac-series/:id', validate({ params: idParams, body: bacSeriesBody }), bacSeries.updateBacSeries);
router.delete('/admin/bac-series/:id', validate({ params: idParams }), bacSeries.deleteBacSeries);

module.exports = router;
