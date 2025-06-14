const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { menuMessage } = require(`${BASE_DIR}/utils/messages`);
const path = require("path");

module.exports = {
  name: "menu",
  description: "Menú de comandos",
  commands: ["menu", "ayuda"],
  usage: `${PREFIX}menu`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `\n\n${menuMessage()}`
    );
  },
};
