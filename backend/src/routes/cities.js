const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { cityBody, districtBody } = require('../validators/cities');
const cities = require('../controllers/cities');
const districts = require('../controllers/districts');

/**
 * Routes des villes et des arrondissements.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/cities', cities.listCities);
router.post('/admin/cities', validate({ body: cityBody }), cities.createCity);
router.put('/admin/cities/:id', validate({ params: idParams, body: cityBody }), cities.updateCity);
router.delete('/admin/cities/:id', validate({ params: idParams }), cities.deleteCity);

router.get('/districts', districts.listDistricts);
router.post('/admin/districts', validate({ body: districtBody }), districts.createDistrict);
router.put('/admin/districts/:id', validate({ params: idParams, body: districtBody }), districts.updateDistrict);
router.delete('/admin/districts/:id', validate({ params: idParams }), districts.deleteDistrict);

module.exports = router;
