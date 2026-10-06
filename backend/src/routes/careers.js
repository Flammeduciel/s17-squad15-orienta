const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { careerBody } = require('../validators/careers');
const careers = require('../controllers/careers');

/**
 * Routes des débouchés (bloc BK3).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/careers', careers.listCareers);
router.get('/admin/careers', careers.listAllCareers);
router.post('/admin/careers', validate({ body: careerBody }), careers.createCareer);
router.put('/admin/careers/:id', validate({ params: idParams, body: careerBody }), careers.updateCareer);
router.delete('/admin/careers/:id', validate({ params: idParams }), careers.deleteCareer);

module.exports = router;
