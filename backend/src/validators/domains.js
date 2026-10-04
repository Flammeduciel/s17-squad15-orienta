/**
 * Schémas de validation des routes des domaines d'insertion.
 *
 * @module validators/domains
 */
const { z } = require('zod');
const { requiredText } = require('./common');

/** Paramètres de `/admin/domains/:id` : l'identifiant est un slug, pas un nombre. */
const domainParams = z.object({ id: requiredText(20) });

/** Corps de la création et de la modification d'un domaine. */
const domainBody = z.object({
  name: requiredText(100),
  color: z
    .string({ error: 'est obligatoire.' })
    .regex(/^#[0-9A-Fa-f]{6}$/, 'doit être une couleur au format #RRGGBB.'),
  // Nom d'une icône Font Awesome, sans le préfixe « fa- » : `stethoscope`, `laptop-code`…
  icon: z
    .string({ error: 'doit être un nom d\'icône.' })
    .regex(/^[a-z0-9-]{1,40}$/, 'doit être un nom d\'icône Font Awesome, comme « laptop-code ».')
    .default('shapes'),
});

module.exports = { domainParams, domainBody };
