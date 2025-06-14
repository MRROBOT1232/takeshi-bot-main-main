const { PREFIX } = require(`${BASE_DIR}/config`);
const { isBotAdmin } = require(`${BASE_DIR}/middlewares`);
const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "promover",
  description: "Asciende a un usuario a administrador del grupo",
  commands: ["promover", "promove", "promote", "add-adm"],
  usage: `${PREFIX}promover @usuario`,
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
      return sendWarningReply("Por favor, menciona a un usuario para ascender.");
    }

    if (!(await isBotAdmin({ remoteJid, socket }))) {
      return sendWarningReply(
        "¡Necesito ser administrador del grupo para ascender a otros miembros!"
      );
    }

    const userId = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      await socket.groupParticipantsUpdate(remoteJid, [userId], "promote");
      await sendSuccessReply("¡Usuario ascendido con éxito!");
    } catch (error) {
      errorLog(`Error al ascender al usuario: ${error.message}`);
      await sendErrorReply("Ocurrió un error al intentar ascender al usuario.");
    }
  },
};
