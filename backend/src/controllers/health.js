const { checkDatabase } = require('../config/db');
const { version } = require('../../package.json');

/**
 * `GET /health` — état de l'API, interrogé par le health check Dokploy
 * (voir deploy.md).
 *
 * Répond 200 tant que l'API peut servir : base joignable, ou base pas encore
 * branchée. Répond 503 si une base est configurée mais ne répond pas — l'API
 * tourne, mais ne peut plus rien lire ni écrire.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getHealth(req, res) {
  const database = await checkDatabase();
  const healthy = database.status !== 'down';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'orienta-api',
    version,
    environment: process.env.NODE_ENV || 'development',
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
  });
}

module.exports = { getHealth };
