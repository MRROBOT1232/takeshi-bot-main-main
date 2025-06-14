const fs = require("fs");
const path = require("path");
const BANK_PATH = path.resolve(__dirname, "../../data/bank.json");

function getBank() {
  if (!fs.existsSync(BANK_PATH)) return {};
  return JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
}

module.exports = {
  name: "bank",
  description: "Consulta tu saldo de monedas.",
  commands: ["bank", "saldo", "monedas"],
  usage: "/bank",
  handle: async ({ userJid, sendReply }) => {
    const bank = getBank();
    const coins = bank[userJid]?.coins || 0;
    await sendReply(`Tienes ${coins} monedas 💰`);
  },
};