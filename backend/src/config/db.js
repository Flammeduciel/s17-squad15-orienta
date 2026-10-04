const { Pool } = require('pg');
const { databaseUrl } = require('./env');
const httpError = require('../utils/httpError');

/**
 * Pool de connexions PostgreSQL, partagé par toute l'application.
 * Vaut `null` sans `DATABASE_URL` : l'API démarre quand même, et `/health` le
 * signale. Les modèles n'utilisent pas le pool directement mais `query()`.
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

/**
 * Exécute une requête SQL paramétrée. C'est par elle que passent les modèles.
 *
 * Les valeurs vont toujours dans `params` (`$1`, `$2`…), jamais collées dans le
 * texte SQL : PostgreSQL les échappe et l'injection SQL devient impossible.
 *
 * @param {string} sql Requête, avec `$1`, `$2`… à la place des valeurs.
 * @param {unknown[]} [params] Valeurs, dans l'ordre des `$n`.
 * @returns {Promise<import('pg').QueryResult>}
 * @throws {Error} 503 `BASE_INDISPONIBLE` si aucune base n'est configurée.
 *
 * @example
 * const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
 */
async function query(sql, params = []) {
  if (!pool) {
    throw httpError(503, 'BASE_INDISPONIBLE', "La base de données n'est pas configurée.");
  }
  return pool.query(sql, params);
}

/**
 * Exécute plusieurs requêtes qui doivent réussir ou échouer ensemble.
 * Si la fonction lève une erreur, rien n'est enregistré.
 *
 * @param {(client: import('pg').PoolClient) => Promise<any>} work Reçoit un client : y faire `client.query(sql, params)`.
 * @returns {Promise<any>} Ce que renvoie `work`.
 *
 * @example
 * await transaction(async (client) => {
 *   await client.query('UPDATE degrees SET duration = $1 WHERE id = $2', [3, id]);
 *   await client.query('DELETE FROM program_fees WHERE year > $1', [3]);
 * });
 */
async function transaction(work) {
  if (!pool) {
    throw httpError(503, 'BASE_INDISPONIBLE', "La base de données n'est pas configurée.");
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, checkDatabase, query, transaction };
