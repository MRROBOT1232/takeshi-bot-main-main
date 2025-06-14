const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    // Reacciona con un emoji de ping pong
    await sendReact("🏓");
    // Envía la respuesta de texto "Pong!"
    await sendReply(`🏓 Pong!`);
  },
};
