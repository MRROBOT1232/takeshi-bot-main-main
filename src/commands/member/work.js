const fs = require("fs");
const path = require("path");
const BANK_PATH = path.resolve(__dirname, "../../data/bank.json");

function getBank() {
  if (!fs.existsSync(BANK_PATH)) return {};
  return JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
}

function saveBank(bank) {
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
}

module.exports = {
  name: "work",
  description: "Trabaja y gana monedas.",
  commands: ["work"],
  usage: "/work",
  handle: async ({ userJid, sendReply }) => {
    try {
      const bank = getBank();
      if (!bank[userJid]) bank[userJid] = { coins: 0, personajes: [] };
      const coins = Math.floor(Math.random() * 41) + 10; // 10-50 monedas
      bank[userJid].coins += coins;
      saveBank(bank);
      await sendReply(`¡Trabajaste y ganaste ${coins} monedas! 💰`);
    } catch (e) {
      console.error("Error en /work:", e);
      await sendReply("Ocurrió un error al trabajar.");
    }
  },
};