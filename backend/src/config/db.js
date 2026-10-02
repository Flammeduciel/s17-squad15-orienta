const { Pool } = require('pg');
const { databaseUrl } = require('./env');

/**
 * Pool de connexions PostgreSQL, partagé par toute l'application.
 * Vaut `null` sans `DATABASE_URL` : l'API démarre quand même, et `/health` le
 * signale. Les modèles importent ce pool pour exécuter leurs requêtes.
 *
 * @type {import('pg').Pool|null}
 */
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 2000 })
  : null;

// Une connexion inactive qui tombe (base redémarrée, réseau coupé) émet une
// erreur sur le pool : sans écouteur, elle arrêterait le processus.
if (pool) {
  pool.on('error', (error) => {
    console.error('PostgreSQL : connexion inactive perdue —', error.message);
  });
}

/**
 * État de la connexion à la base.
 *
 * @typedef {object} DatabaseStatus
 * @property {'up'|'down'|'not_configured'} status `up` : la base a répondu ;
 *   `down` : injoignable ou trop lente ; `not_configured` : `DATABASE_URL` absente.
 * @property {number} [latency_ms] Temps de réponse en millisecondes, quand `status` vaut `up`.
 */

/**
 * Vérifie que la base répond. Ne lève jamais d'erreur : le détail d'une panne
 * est écrit dans les journaux, pas renvoyé (la route `/health` est publique).
 *
 * @returns {Promise<DatabaseStatus>}
 */
async function checkDatabase() {
  if (!pool) {
    return { status: 'not_configured' };
  }
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return { status: 'up', latency_ms: Date.now() - start };
  } catch (error) {
    console.error('PostgreSQL injoignable —', error.message);
    return { status: 'down' };
  }
}

module.exports = { pool, checkDatabase };
