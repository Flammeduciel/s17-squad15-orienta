const cors = require('cors');

/**
 * Middleware CORS de l'API.
 *
 * POUR L'INSTANT, TOUTES LES ORIGINES SONT ACCEPTÉES. Pendant le développement,
 * chaque développeur doit pouvoir appeler l'API — y compris celle déjà
 * déployée — depuis son poste, pour tester ses pages. Restreindre les origines
 * maintenant bloquerait ces tests.
 *
 * À rétablir avant la mise en production : remplacer l'export du bas par la
 * version restreinte commentée ci-dessous, qui n'accepte que les interfaces
 * listées dans `CORS_ORIGIN`.
 */

// const { corsOrigin, isProduction } = require('../config/env');
//
// // En développement, sans CORS_ORIGIN, les deux serveurs Vite sont acceptés.
// // En production, seule la liste de CORS_ORIGIN compte.
// const devOrigins = ['http://localhost:5173', 'http://localhost:5174'];
// const allowed = corsOrigin.length || isProduction ? corsOrigin : devOrigins;
//
// module.exports = cors({
//   origin: allowed,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   maxAge: 600,
// });

/** @type {import('express').RequestHandler} */
module.exports = cors();
