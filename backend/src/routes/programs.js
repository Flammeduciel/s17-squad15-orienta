const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { programsQuery, adminProgramsQuery, programBody } = require('../validators/programs');
const programs = require('../controllers/programs');

/**
 * Routes des formations et des indicateurs (bloc BK5).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/programs', validate({ query: programsQuery }), programs.listPrograms);
router.get('/programs/:id', validate({ params: idParams }), programs.getProgram);

router.get('/admin/indicators', programs.getIndicators);
router.get('/admin/programs', validate({ query: adminProgramsQuery }), programs.listAllPrograms);
router.get('/admin/programs/:id', validate({ params: idParams }), programs.getAnyProgram);
router.post('/admin/programs', validate({ body: programBody }), programs.createProgram);
router.put('/admin/programs/:id', validate({ params: idParams, body: programBody }), programs.updateProgram);
router.delete('/admin/programs/:id', validate({ params: idParams }), programs.deleteProgram);

module.exports = router;
