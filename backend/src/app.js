const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middlewares/auth');
const { notFound, errorHandler } = require('./middlewares/errors');
const { uploadDir } = require('./config/env');
const domainsRoutes = require("./routes/domains");

/**
 * L'application Express, sans l'écoute du port : `server.js` s'en charge.
 *
 * L'ordre des `app.use` compte : CORS et lecture du corps d'abord, puis les
 * routes, puis les deux middlewares d'erreurs en dernier.
 *
 * @type {import('express').Express}
 */
const app = express();

app.disable('x-powered-by');
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));

// Images déposées par le back-office (`image_url` d'un institut). Le dossier ne
// contient que des images : on interdit au navigateur d'y deviner autre chose.
app.use(
  '/uploads',
  express.static(uploadDir, {
    index: false,
    maxAge: '7d',
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
  }),
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Chaque ressource ajoute ici son fichier de routes, avant `notFound`.
app.use(healthRoutes);
app.use(authRoutes);

// Tout ce qui commence par /admin exige une session Squad : les routes
// d'administration des blocs suivants sont protégées sans rien ajouter.
app.use('/admin', requireAuth);
// BK3 — référentiels (après requireAuth : leurs routes /admin sont protégées).
app.use(domainsRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
