const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");
const {
  instituteListQuery,
  instituteBody,
} = require("../validators/institutes");
const institutes = require("../controllers/institutes");

/**
 * Instituts (bloc BK4) : lecture publique et écriture de la Squad.
 * Les chemins `/admin/...` sont protégés par `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get(
  "/institutes",
  validate({ query: instituteListQuery }),
  institutes.list,
);
router.get("/institutes/:id", validate({ params: idParams }), institutes.get);
router.post(
  "/admin/institutes",
  validate({ body: instituteBody }),
  institutes.create,
);
router.put(
  "/admin/institutes/:id",
  validate({ params: idParams, body: instituteBody }),
  institutes.update,
);
router.delete(
  "/admin/institutes/:id",
  validate({ params: idParams }),
  institutes.remove,
);

module.exports = router;
