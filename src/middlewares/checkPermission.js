/**
 * Interceptores de validación
 * de permisos de usuarios.
 *
 * @author Dev Gui
 */
const { OWNER_NUMBER } = require("../config");

exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
  // Permiso de miembro: siempre permitido
  if (type === "member") {
    return true;
  }

  try {
    // Obtiene los metadatos del grupo, incluyendo participantes y propietario
    const { participants, owner } = await socket.groupMetadata(remoteJid);

    // Busca al participante que coincide con el usuario que ejecutó el comando
    const participant = participants.find(
      (participant) => participant.id === userJid
    );

    if (!participant) {
      return false;
    }

    // Determina si el usuario es dueño, superadmin o el dueño del bot
    const isOwner =
      participant.id === owner || participant.admin === "superadmin";

    const isAdmin = participant.admin === "admin";

    const isBotOwner = userJid === `${OWNER_NUMBER}@s.whatsapp.net`;

    // Verifica los tipos de permiso solicitados
    if (type === "admin") {
      return isOwner || isAdmin || isBotOwner;
    }

    if (type === "owner") {
      return isOwner || isBotOwner;
    }

    return false;
  } catch (error) {
    return false;
  }
};
