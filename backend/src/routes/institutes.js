const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");
const { instituteListQuery } = require("../validators/institutes");
const institutes = require("../controllers/institutes");

/**
 * Instituts (bloc BK4) : lecture publique.
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

module.exports = router;
