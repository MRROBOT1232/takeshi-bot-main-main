const { isGroup } = require(`${BASE_DIR}/utils`);
const { DEFAULT_PREFIX } = require(`${BASE_DIR}/config`);
const { isBotAdmin } = require(`${BASE_DIR}/middlewares`);

module.exports = {
  name: "rebajar",
  description: "Baja a un administrador a miembro común",
  commands: ["rebajar", "rebaixa", "demote"],
  usage: `${DEFAULT_PREFIX}rebaixar @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    socket,
    sendWarningReply,
    sendSuccessReply,
    sendErrorReply,
  }) => {
    if (!isGroup(remoteJid)) {
      return sendWarningReply("¡Este comando solo puede usarse en grupos!");
    }

    if (!args.length || !args[0]) {
      return sendWarningReply(
        "Por favor, menciona a un administrador para bajar."
      );
    }

    if (!(await isBotAdmin({ remoteJid, socket }))) {
      return sendWarningReply(
        "¡Necesito ser administrador del grupo para bajar a otros administradores!"
      );
    }

    const userId = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      await socket.groupParticipantsUpdate(remoteJid, [userId], "demote");
      sendSuccessReply("¡Usuario bajado con éxito!");
    } catch (error) {
      console.error(error);
      sendErrorReply("Ocurrió un error al intentar bajar al usuario.");
    }
  },
};
