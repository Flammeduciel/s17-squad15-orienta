const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');
const { loginBody } = require('../validators/auth');
const auth = require('../controllers/auth');

/**
 * Routes d'authentification de la Squad (bloc BK2).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.post('/auth/login', validate({ body: loginBody }), auth.login);
router.post('/auth/logout', requireAuth, auth.logout);

module.exports = router;
