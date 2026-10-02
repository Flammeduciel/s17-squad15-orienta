const express = require('express');
const healthRoutes = require('./routes/health');
const { notFound, errorHandler } = require('./middlewares/errors');

/* L'application Express, sans l'écoute du port : server.js s'en charge.
   Chaque ressource ajoute ici son fichier de routes, avant `notFound`. */
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(healthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
