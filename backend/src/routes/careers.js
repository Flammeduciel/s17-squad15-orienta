const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");
const { careerBody } = require("../validators/careers");
const careers = require("../controllers/careers");

/**
 * Débouchés (bloc BK3) : lecture publique et CRUD de la Squad.
 * À monter après `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get("/careers", careers.listPublic);
router.get("/admin/careers", careers.listAll);
router.post("/admin/careers", validate({ body: careerBody }), careers.create);
router.put(
  "/admin/careers/:id",
  validate({ params: idParams, body: careerBody }),
  careers.update,
);
router.delete(
  "/admin/careers/:id",
  validate({ params: idParams }),
  careers.remove,
);

module.exports = router;
