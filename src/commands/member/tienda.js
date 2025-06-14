const personajes = require("../../data/pecados-personajes.json");

module.exports = {
  name: "tienda",
  description: "Muestra los personajes disponibles para comprar.",
  commands: ["tienda", "shop"],
  usage: "/tienda",
  handle: async ({ sendReply }) => {
    let msg = "🛒 *Tienda de Personajes*\n";
    personajes.forEach((p, i) => {
      msg += `\n${i + 1}. *${p.nombre}* - ${p.precio || 100} monedas`;
    });
    await sendReply(msg);
  },
};