const httpError = require("../utils/httpError");
const contact = require("../models/contact");
const { sendMail } = require("../services/mail");

/** Envoie sans jamais faire échouer la requête : une panne SMTP est journalisée. */
async function safeSend(mail) {
  try {
    await sendMail(mail);
  } catch (error) {
    console.error(`E-mail non envoyé à ${mail.to} —`, error.message);
  }
}

/**
 * `POST /contact` : 202 `{ received: true }`.
 * Enregistre la question, la transmet à l'institut et envoie un accusé de réception.
 */
async function send(req, res) {
  const { program_id: programId, name, email, message } = req.valid.body;
  const target = await contact.findTarget(programId);
  if (!target) {
    throw httpError(
      404,
      "FORMATION_INTROUVABLE",
      "Aucune formation ne correspond à cet identifiant.",
    );
  }
  await contact.create(req.valid.body);

  if (target.institute_email) {
    await safeSend({
      to: target.institute_email,
      subject: `Orienta — question sur « ${target.program_name} »`,
      text: `Un visiteur pose une question sur la formation « ${target.program_name} ».\n\nNom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}\n\nPour répondre, écrivez directement à ${email}.`,
    });
  } else {
    console.warn(
      `Institut « ${target.institute_name} » sans e-mail : question de ${email} enregistrée mais non transmise.`,
    );
  }
  await safeSend({
    to: email,
    subject: "Orienta — votre question a bien été reçue",
    text: `Bonjour ${name},\n\nVotre question sur « ${target.program_name} » a été transmise à ${target.institute_name}.\n\nVotre message :\n${message}\n\nL'équipe Orienta`,
  });
  res.status(202).json({ received: true });
}

module.exports = { send };
