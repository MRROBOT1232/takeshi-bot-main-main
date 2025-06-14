const { PREFIX } = require(`${BASE_DIR}/config`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);
const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "anti-link",
  description: "Activa/desactiva la función anti-enlaces en el grupo.",
  commands: ["anti-link"],
  usage: `${PREFIX}anti-link (1/0)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "¡Debes ingresar 1 o 0 (activar o desactivar)!"
      );
    }

    const antiLinkOn = args[0] === "1";
    const antiLinkOff = args[0] === "0";

    if (!antiLinkOn && !antiLinkOff) {
      throw new InvalidParameterError(
        "¡Debes ingresar 1 o 0 (activar o desactivar)!"
      );
    }

    if (antiLinkOn) {
      activateAntiLinkGroup(remoteJid);
    } else {
      deactivateAntiLinkGroup(remoteJiFd);
    }

    await sendSuccessReact();

    const context = antiLinkOn ? "activado" : "desactivado";

    await sendReply(`¡Función anti-enlaces ${context} con éxito!`);
  },
};
