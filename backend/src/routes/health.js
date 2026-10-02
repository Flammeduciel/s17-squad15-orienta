const express = require('express');
const { getHealth } = require('../controllers/health');

const router = express.Router();

router.get('/health', getHealth);

module.exports = router;
