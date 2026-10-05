const express = require("express");
const { receiveImage } = require("../middlewares/upload");
const images = require("../controllers/images");

/**
 * Images d'instituts (bloc BK4). Le chemin `/admin/images` est protégé par
 * `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.post("/admin/images", receiveImage, images.upload);

module.exports = router;
