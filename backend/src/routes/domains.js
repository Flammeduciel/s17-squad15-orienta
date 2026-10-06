const express = require("express");
const validate = require("../middlewares/validate");
const { domainIdParams, domainBody } = require("../validators/domains");
const domains = require("../controllers/domains");

/**
 * Domaines d'insertion (bloc BK3) : lecture publique et CRUD de la Squad.
 * Les chemins `/admin/...` sont protégés par `app.use('/admin', requireAuth)` :
 * ce routeur doit donc être monté après cette ligne.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get("/domains", domains.list);
router.post("/admin/domains", validate({ body: domainBody }), domains.create);
router.put(
  "/admin/domains/:id",
  validate({ params: domainIdParams, body: domainBody }),
  domains.update,
);
router.delete(
  "/admin/domains/:id",
  validate({ params: domainIdParams }),
  domains.remove,
);

module.exports = router;
