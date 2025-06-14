/**
 * Mensajes del bot
 *
 * @author Dev Gui
 */
const { BOT_NAME, PREFIX } = require("../config");

exports.waitMessage = "Cargando datos...";

exports.menuMessage = () => {
  const date = new Date();

  return `╭━━⪩ ¡BIENVENIDO! ⪨━━
▢
▢ • ${BOT_NAME}
▢ • Fecha: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefijo: ${PREFIX}
▢
╰━━─「🪐」─━━

╭━━⪩ DUEÑO ⪨━━
▢
▢ • ${PREFIX}get-id
▢ • ${PREFIX}off
▢ • ${PREFIX}on
▢
╰━━─「🌌」─━━

╭━━⪩ ADMINISTRADORES ⪨━━
▢
▢ • ${PREFIX}anti-link (1/0)
▢ • ${PREFIX}auto-responder (1/0)
▢ • ${PREFIX}ban
▢ • ${PREFIX}exit (1/0)
▢ • ${PREFIX}hidetag
▢ • ${PREFIX}promover
▢ • ${PREFIX}rebajar
▢ • ${PREFIX}welcome (1/0)
▢
╰━━─「⭐」─━━

╭━━⪩ PRINCIPAL ⪨━━
▢
▢ • ${PREFIX}perfil
▢ • ${PREFIX}ping
▢
╰━━─「🚀」─━━

╭━━⪩ JUEGOS / BROMAS ⪨━━
▢
▢ • ${PREFIX}abrazar
▢ • ${PREFIX}besar
▢ • ${PREFIX}cenar
▢ • ${PREFIX}luchar
▢ • ${PREFIX}matar
▢ • ${PREFIX}golpear
▢
╰━━─「🎡」─━━`;
};
