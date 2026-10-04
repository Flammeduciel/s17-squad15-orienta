const express = require('express');
const validate = require('../middlewares/validate');
const { uploadInstituteImage } = require('../middlewares/upload');
const { idParams } = require('../validators/common');
const { institutesQuery, instituteBody } = require('../validators/institutes');
const institutes = require('../controllers/institutes');
const { uploadImage } = require('../controllers/images');

/**
 * Routes des instituts, des arrondissements et du dépôt d'image (bloc BK4).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/institutes', validate({ query: institutesQuery }), institutes.listInstitutes);
router.get('/institutes/:id', validate({ params: idParams }), institutes.getInstitute);
router.get('/districts', institutes.listDistricts);

router.post('/admin/institutes', validate({ body: instituteBody }), institutes.createInstitute);
router.put('/admin/institutes/:id', validate({ params: idParams, body: instituteBody }), institutes.updateInstitute);
router.delete('/admin/institutes/:id', validate({ params: idParams }), institutes.deleteInstitute);
router.post('/admin/images', uploadInstituteImage, uploadImage);

module.exports = router;
