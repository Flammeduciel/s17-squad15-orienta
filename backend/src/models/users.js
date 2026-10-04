/**
 * Requêtes SQL sur la table `users` (comptes de la Squad).
 *
 * @module models/users
 */
const { query } = require('../config/db');

/**
 * Compte Squad tel que lu en base.
 *
 * @typedef {object} User
 * @property {string} id
 * @property {string} email Adresse e-mail, qui sert d'identifiant de connexion.
 * @property {string} password_hash Hash bcrypt, jamais renvoyé au client.
 * @property {string} name
 * @property {string} role
 */

const COLUMNS = 'id, email, password_hash, name, role';

/**
 * @param {string} id
 * @returns {Promise<User|null>}
 */
async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

/**
 * Recherche insensible à la casse : `Squad@Exemple.cg` trouve `squad@exemple.cg`.
 *
 * @param {string} email Adresse saisie à la connexion.
 * @returns {Promise<User|null>}
 */
async function findByEmail(email) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM users WHERE lower(email) = lower($1)`, [email]);
  return rows[0] || null;
}

module.exports = { findById, findByEmail };
