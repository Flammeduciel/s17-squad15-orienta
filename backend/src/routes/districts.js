const express = require("express");
const districts = require("../controllers/districts");

/**
 * Arrondissements (bloc BK4) : lecture publique.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get("/districts", districts.list);

module.exports = router;
