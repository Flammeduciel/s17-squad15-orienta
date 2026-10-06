const express = require("express");
const validate = require("../middlewares/validate");
const { contactBody } = require("../validators/contact");
const contact = require("../controllers/contact");

/**
 * Formulaire de contact public (bloc BK6) : aucune authentification.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.post("/contact", validate({ body: contactBody }), contact.send);

module.exports = router;
