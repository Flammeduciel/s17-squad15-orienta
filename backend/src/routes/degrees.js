const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");
const { degreeBody } = require("../validators/degrees");
const degrees = require("../controllers/degrees");

/**
 * Diplômes (bloc BK3) : lecture publique et CRUD de la Squad.
 * À monter après `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get("/degrees", degrees.list);
router.post("/admin/degrees", validate({ body: degreeBody }), degrees.create);
router.put(
  "/admin/degrees/:id",
  validate({ params: idParams, body: degreeBody }),
  degrees.update,
);
router.delete(
  "/admin/degrees/:id",
  validate({ params: idParams }),
  degrees.remove,
);

module.exports = router;
