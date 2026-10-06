const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { degreeBody } = require('../validators/degrees');
const degrees = require('../controllers/degrees');

/**
 * Routes des diplômes (bloc BK3).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/degrees', degrees.listDegrees);
router.post('/admin/degrees', validate({ body: degreeBody }), degrees.createDegree);
router.put('/admin/degrees/:id', validate({ params: idParams, body: degreeBody }), degrees.updateDegree);
router.delete('/admin/degrees/:id', validate({ params: idParams }), degrees.deleteDegree);

module.exports = router;
