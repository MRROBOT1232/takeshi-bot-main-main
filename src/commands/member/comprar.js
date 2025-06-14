const fs = require("fs");
const path = require("path");
const personajes = require("../../data/pecados-personajes.json");
const BANK_PATH = path.resolve(__dirname, "../../data/bank.json");

function getBank() {
  if (!fs.existsSync(BANK_PATH)) return {};
  return JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
}

function saveBank(bank) {
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
}

module.exports = {
  name: "comprar",
  description: "Compra un personaje de la tienda.",
  commands: ["comprar"],
  usage: "/comprar <número>",
  handle: async ({ userJid, args, sendReply }) => {
    const idx = parseInt(args[0], 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= personajes.length) {
      await sendReply("Debes indicar el número del personaje que quieres comprar. Usa /tienda para ver la lista.");
      return;
    }
    const personaje = personajes[idx];
    const precio = personaje.precio || 100;

    const bank = getBank();
    if (!bank[userJid]) bank[userJid] = { coins: 0, personajes: [] };
    if (bank[userJid].coins < precio) {
      await sendReply("No tienes suficientes monedas.");
      return;
    }
    if (bank[userJid].personajes.includes(personaje.nombre)) {
      await sendReply("Ya tienes este personaje.");
      return;
    }
    bank[userJid].coins -= precio;
    bank[userJid].personajes.push(personaje.nombre);
    saveBank(bank);
    await sendReply(`¡Compraste a *${personaje.nombre}*!`);
  },
};