const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { domainBody } = require('../validators/domains');
const domains = require('../controllers/domains');

/**
 * Routes des domaines d'insertion (bloc BK3).
 * Les routes `/admin/…` sont déjà protégées par `requireAuth` dans `app.js`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/domains', domains.listDomains);
router.post('/admin/domains', validate({ body: domainBody }), domains.createDomain);
router.put('/admin/domains/:id', validate({ params: idParams, body: domainBody }), domains.updateDomain);
router.delete('/admin/domains/:id', validate({ params: idParams }), domains.deleteDomain);

module.exports = router;
