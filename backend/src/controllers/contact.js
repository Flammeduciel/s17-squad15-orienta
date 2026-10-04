const httpError = require('../utils/httpError');
const { query } = require('../config/db');
const { sendMail } = require('../services/mail');
const programService = require('../services/programs');
const institutes = require('../models/institutes');

/**
 * `POST /contact` — transmet la question d'un bachelier à l'institut (EX-06).
 *
 * La demande est enregistrée, puis deux e-mails partent : la question vers
 * l'institut, et un accusé de réception vers le bachelier. Si un envoi échoue,
 * la demande reste enregistrée et la réponse reste 202 : l'erreur est écrite
 * dans les journaux.
 *
 * @param {import('express').Request} req `req.valid.body` : `{ program_id, name, email, message }`.
 * @param {import('express').Response} res 202 `{ received: true }`.
 * @returns {Promise<void>}
 */
async function sendQuestion(req, res) {
  const { program_id: programId, name, email, message } = req.valid.body;
  const program = await programService.getDetail(programId);
  if (!program || program.status !== 'published') {
    throw httpError(404, 'FORMATION_INTROUVABLE', 'Aucune formation ne correspond à cet identifiant.');
  }
  await query('INSERT INTO contact_requests (program_id, name, email, message) VALUES ($1, $2, $3, $4)', [
    programId,
    name,
    email,
    message,
  ]);

  const institute = await institutes.findById(program.institute.id);
  try {
    if (institute.email) {
      await sendMail({
        to: institute.email,
        subject: `Orienta — question sur « ${program.name} »`,
        text: `${name} (${email}) pose une question sur la formation « ${program.name} » :\n\n${message}\n\nRépondez-lui directement à ${email}.`,
      });
    }
    await sendMail({
      to: email,
      subject: `Orienta — votre question à ${institute.short_name} a bien été transmise`,
      text: `Bonjour ${name},\n\nVotre question sur la formation « ${program.name} » a été transmise au secrétariat de ${institute.name}. L'institut vous répondra à cette adresse.\n\nVotre message :\n${message}`,
    });
  } catch (error) {
    console.error("Question enregistrée, mais l'e-mail n'est pas parti —", error.message);
  }
  res.status(202).json({ received: true });
}

module.exports = { sendQuestion };
