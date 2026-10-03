const express = require('express');
const { getHealth } = require('../controllers/health');

/**
 * Routes d'état de l'API.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get('/health', getHealth);

module.exports = router;
