const { OWNER_NUMBER } = require("../../config");

const { PREFIX, BOT_NUMBER } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors/DangerError`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "banir",
  description: "Elimino a un miembro del grupo",
  commands: ["ban", "kick"],
  usage: `${PREFIX}ban @mencionar_miembro 
  
o 

${PREFIX}ban (respondiendo a un mensaje)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    sendSuccessReact,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "¡Debes mencionar o responder a un miembro!"
      );
    }

    const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
    const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

    if (memberToRemoveNumber.length < 7 || memberToRemoveNumber.length > 15) {
      throw new InvalidParameterError("¡Número inválido!");
    }

    if (memberToRemoveJid === userJid) {
      throw new DangerError("¡No puedes eliminarte a ti mismo!");
    }

    if (memberToRemoveNumber === OWNER_NUMBER) {
      throw new DangerError("¡No puedes eliminar al dueño del bot!");
    }

    const botJid = toUserJid(BOT_NUMBER);

    if (memberToRemoveJid === botJid) {
      throw new DangerError("¡No puedes eliminarme a mí!");
    }

    await socket.groupParticipantsUpdate(
      remoteJid,
      [memberToRemoveJid],
      "remove"
    );

    await sendSuccessReact();

    await sendReply("¡Miembro eliminado con éxito!");
  },
};
