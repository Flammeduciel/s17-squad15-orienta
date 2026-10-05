const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");
const { bacSeriesBody } = require("../validators/bacSeries");
const bacSeries = require("../controllers/bacSeries");

/**
 * Séries du bac (bloc BK3) : lecture publique et CRUD de la Squad.
 * À monter après `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get("/bac-series", bacSeries.list);
router.post(
  "/admin/bac-series",
  validate({ body: bacSeriesBody }),
  bacSeries.create,
);
router.put(
  "/admin/bac-series/:id",
  validate({ params: idParams, body: bacSeriesBody }),
  bacSeries.update,
);
router.delete(
  "/admin/bac-series/:id",
  validate({ params: idParams }),
  bacSeries.remove,
);

module.exports = router;
