const fs = require("fs");
const path = require("path");
const personajes = require("../../data/pecados-personajes.json");
const BANK_PATH = path.resolve(__dirname, "../../data/bank.json");

function getBank() {
  if (!fs.existsSync(BANK_PATH)) return {};
  return JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
}

module.exports = {
  name: "mispersonajes",
  description: "Muestra los personajes que has comprado.",
  commands: ["mispersonajes", "inventario", "coleccion"],
  usage: "/mispersonajes",
  handle: async ({ userJid, sendReply }) => {
    const bank = getBank();
    const user = bank[userJid];
    if (!user || !user.personajes || user.personajes.length === 0) {
      await sendReply("No tienes personajes comprados todavía.");
      return;
    }
    let msg = "🧑‍🎤 *Tus personajes comprados:*\n";
    user.personajes.forEach((nombre, i) => {
      const p = personajes.find(x => x.nombre === nombre);
      msg += `\n${i + 1}. *${nombre}*${p ? ` (${p.libro})` : ""}`;
    });
    await sendReply(msg);
  },
};