/* Toutes les variables d'environnement sont lues ici, une seule fois.
   Le reste du code importe ce fichier au lieu de lire process.env. */
module.exports = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean),
};
