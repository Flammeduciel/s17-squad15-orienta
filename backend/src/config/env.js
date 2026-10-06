const path = require('node:path');
const crypto = require('node:crypto');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

/**
 * Secret de signature des jetons. En production, il est obligatoire et ne peut
 * pas être la valeur d'exemple : l'API refuse de démarrer plutôt que de signer
 * des jetons falsifiables. En développement, à défaut, un secret aléatoire est
 * tiré au démarrage (les sessions ne survivent alors pas à un redémarrage).
 *
 * @returns {string}
 */
function readJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret !== 'change-me-in-production') {
    return secret;
  }
  if (isProduction) {
    throw new Error("JWT_SECRET est absent ou vaut la valeur d'exemple : impossible de démarrer en production.");
  }
  console.warn('JWT_SECRET absent : secret aléatoire utilisé, les sessions seront perdues au redémarrage.');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Configuration de l'API, lue une seule fois dans les variables d'environnement.
 * Le reste du code importe ce fichier au lieu de lire `process.env`.
 * La liste des variables et leurs valeurs d'exemple sont dans `.env.example`.
 *
 * @typedef {object} Env
 * @property {string} nodeEnv Environnement d'exécution (`development`, `production`…).
 * @property {boolean} isProduction Vrai quand `NODE_ENV` vaut `production`.
 * @property {number} port Port d'écoute de l'API.
 * @property {string|undefined} databaseUrl Chaîne de connexion PostgreSQL.
 * @property {string} jwtSecret Secret de signature des jetons de connexion.
 * @property {string} jwtExpiresIn Durée de validité d'une session (`8h`, `30m`…).
 * @property {string[]} corsOrigin Interfaces autorisées à appeler l'API depuis un navigateur.
 * @property {string} uploadDir Dossier des images déposées, servi sous `/uploads`.
 * @property {number} maxUploadBytes Taille maximale d'une image, en octets.
 * @property {string|undefined} smtpUrl Serveur d'envoi des e-mails ; absent, les e-mails sont écrits dans les journaux.
 * @property {string} mailFrom Expéditeur des e-mails.
 */

/** @type {Env} */
module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: readJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES) || 2 * 1024 * 1024,
  smtpUrl: process.env.SMTP_URL,
  mailFrom: process.env.MAIL_FROM || 'Orienta <no-reply@orienta.local>',
};
