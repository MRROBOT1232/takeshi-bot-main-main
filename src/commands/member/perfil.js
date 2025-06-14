const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);
const { getProfileImageData } = require(`${BASE_DIR}/services/baileys`);

module.exports = {
  name: "perfil",
  description: "Muestra la información del usuario",
  commands: ["perfil", "profile"],
  usage: `${PREFIX}perfil o perfil @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    userJid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
  }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError(
        "Este comando solo puede usarse en grupos."
      );
    }

    // Obtiene el JID del usuario objetivo, si no hay argumento usa el propio usuario
    const targetJid = args[0]
      ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net"
      : userJid;

    await sendWaitReply("Cargando perfil...");

    try {
      let profilePicUrl;
      let userName;
      let userRole = "Miembro";

      try {
        // Obtiene la foto de perfil del usuario objetivo
        const { profileImage } = await getProfileImageData(socket, targetJid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;

        // Obtiene información de contacto para el nombre
        const contactInfo = await socket.onWhatsApp(targetJid);
        userName = contactInfo[0]?.name || "Usuario desconocido";
      } catch (error) {
        errorLog(
          `Error al obtener datos del usuario ${targetJid}: ${JSON.stringify(
            error,
            null,
            2
          )}`
        );
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      // Obtiene metadata del grupo para verificar rol
      const groupMetadata = await socket.groupMetadata(remoteJid);

      const participant = groupMetadata.participants.find(
        (participant) => participant.id === targetJid
      );

      if (participant?.admin) {
        userRole = "Administrador";
      }

      // Datos aleatorios para la "diversión" del perfil
      const randomPercent = Math.floor(Math.random() * 100);
      const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
      const beautyLevel = Math.floor(Math.random() * 100) + 1;

      const mensaje = `
👤 *Nombre:* @${targetJid.split("@")[0]}\n
🎖️ *Rol:* ${userRole}\n
🌚 *Programa:* R$ ${programPrice}\n
🐮 *Gado:* ${randomPercent + 7 || 5}%\n
🎱 *Passiva:* ${randomPercent + 5 || 10}%\n
✨ *Belleza:* ${beautyLevel}%`;

      const mentions = [targetJid];

      await sendSuccessReact();

      // Envía el mensaje con la imagen y la leyenda mencionando al usuario
      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensaje,
        mentions: mentions,
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("Ocurrió un error al intentar verificar el perfil.");
    }
  },
};
