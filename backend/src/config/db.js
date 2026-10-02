const { Pool } = require('pg');
const { databaseUrl } = require('./env');

/* Le pool de connexions PostgreSQL, partagé par toute l'application.
   Sans DATABASE_URL, il vaut `null` : l'API démarre quand même, et /health le
   signale. Les modèles importent ce fichier pour exécuter leurs requêtes. */
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 2000 })
  : null;

/* Une connexion inactive qui tombe (base redémarrée, réseau coupé) émet une
   erreur sur le pool : sans écouteur, elle arrêterait le processus. */
if (pool) {
  pool.on('error', (error) => {
    console.error('PostgreSQL : connexion inactive perdue —', error.message);
  });
}

/* Vérifie que la base répond. Ne lève jamais d'erreur : renvoie un état.
     { status: 'not_configured' }            DATABASE_URL absente
     { status: 'up', latency_ms: 3 }         la base a répondu
     { status: 'down' }                      injoignable ou trop lente */
async function checkDatabase() {
  if (!pool) {
    return { status: 'not_configured' };
  }
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return { status: 'up', latency_ms: Date.now() - start };
  } catch (error) {
    /* Le détail reste dans les journaux : /health est public. */
    console.error('PostgreSQL injoignable —', error.message);
    return { status: 'down' };
  }
}

module.exports = { pool, checkDatabase };
