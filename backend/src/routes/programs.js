const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { programsQuery, adminProgramsQuery, programBody } = require('../validators/programs');
const programs = require('../controllers/programs');

/**
 * Formations et indicateurs (bloc BK5) : recherche publique et écriture de la Squad.
 * Les chemins `/admin/...` sont protégés par `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/programs', validate({ query: programsQuery }), programs.list);
router.get('/programs/:id', validate({ params: idParams }), programs.get);

router.get('/admin/indicators', programs.indicators);
router.get('/admin/programs', validate({ query: adminProgramsQuery }), programs.listAll);
router.get('/admin/programs/:id', validate({ params: idParams }), programs.getAny);
router.post('/admin/programs', validate({ body: programBody }), programs.create);
router.put('/admin/programs/:id', validate({ params: idParams, body: programBody }), programs.update);
router.delete('/admin/programs/:id', validate({ params: idParams }), programs.remove);

module.exports = router;
