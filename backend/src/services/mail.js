/**
 * Envoi des e-mails de l'API.
 *
 * Avec `SMTP_URL`, les e-mails partent par ce serveur. Sans, ils sont écrits
 * dans les journaux : pratique en développement pour récupérer un lien de
 * réinitialisation sans serveur de messagerie.
 *
 * @module services/mail
 */
const nodemailer = require('nodemailer');
const { smtpUrl, mailFrom } = require('../config/env');

const transport = smtpUrl ? nodemailer.createTransport(smtpUrl) : null;

/**
 * @param {object} mail
 * @param {string} mail.to Destinataire.
 * @param {string} mail.subject Objet.
 * @param {string} mail.text Corps, en texte brut.
 * @returns {Promise<void>}
 */
async function sendMail({ to, subject, text }) {
  if (!transport) {
    console.log(`[e-mail non envoyé : SMTP_URL absente]\nÀ : ${to}\nObjet : ${subject}\n\n${text}\n`);
    return;
  }
  await transport.sendMail({ from: mailFrom, to, subject, text });
}

module.exports = { sendMail };
