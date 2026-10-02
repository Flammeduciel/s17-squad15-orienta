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
 * @property {number} id
 * @property {string} username
 * @property {string|null} email
 * @property {string} password_hash Hash bcrypt, jamais renvoyé au client.
 * @property {string} name
 * @property {string} role
 */

const COLUMNS = 'id, username, email, password_hash, name, role';

/**
 * @param {string} username Nom d'utilisateur, tel que saisi à la connexion.
 * @returns {Promise<User|null>}
 */
async function findByUsername(username) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM users WHERE username = $1`, [username]);
  return rows[0] || null;
}

/**
 * @param {number} id
 * @returns {Promise<User|null>}
 */
async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

/**
 * Recherche insensible à la casse : `Squad@Exemple.cg` trouve `squad@exemple.cg`.
 *
 * @param {string} email
 * @returns {Promise<User|null>}
 */
async function findByEmail(email) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM users WHERE lower(email) = lower($1)`, [email]);
  return rows[0] || null;
}

/**
 * @param {number} id
 * @param {string} passwordHash Nouveau hash bcrypt.
 * @returns {Promise<void>}
 */
async function updatePassword(id, passwordHash) {
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

module.exports = { findByUsername, findById, findByEmail, updatePassword };
