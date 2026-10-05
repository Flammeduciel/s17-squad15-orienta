/**
 * Reconnaît une image JPEG, PNG ou WebP d'après ses premiers octets.
 * Le nom et le `Content-Type` envoyés par le client ne sont jamais crus.
 *
 * @param {Buffer} buffer Contenu du fichier.
 * @returns {'jpg'|'png'|'webp'|null} Extension à utiliser, ou `null` si le format n'est pas accepté.
 */
function detectImageExtension(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= 8 && png.every((byte, i) => buffer[i] === byte)) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

module.exports = { detectImageExtension };
