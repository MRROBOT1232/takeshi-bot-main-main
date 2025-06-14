const { PREFIX } = require(`${BASE_DIR}/config`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);
const { toUserJid } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "abrazar",
  description: "Abraza a un usuario deseado.",
  commands: ["abrazar", "abraza", "abrazo", "abrazos"],
  usage: `${PREFIX}abrazar @numero`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userJid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError("¡Necesitas mencionar o marcar a un miembro!");
    }

    // Extraer número mencionado
    const rawTarget = args.join("").replace(/\s+/g, "");
    const match = rawTarget.match(/^@?\+?\d+$/);
    if (!match && !isReply) {
      await sendErrorReply("Debes mencionar correctamente a un número con el formato @+51987654321.");
      return;
    }

    const targetNumber = rawTarget.replace(/^@/, "").replace("+", "");
    const targetJid = `${targetNumber}@s.whatsapp.net`;

    // Número del remitente que usó el comando
    const fromNumber = userJid.split("@")[0]; // +51999111000

    // Mensaje con mención real
    const mentionText = `@${targetNumber}\n⤷ ${fromNumber} le dio un abrazo apasionado!`;

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "hug-darker-than-black.mp4"),
      mentionText,
      [targetJid]
    );
  },
};
