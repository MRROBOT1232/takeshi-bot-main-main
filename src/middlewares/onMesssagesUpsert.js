/**
 * Evento llamado cuando se envía un mensaje
 * al grupo de WhatsApp.
 *
 * @author Dev Gui
 */
const {
  isAtLeastMinutesInPast,
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
} = require("../utils");
const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { onGroupParticipantsUpdate } = require("./onGroupParticipantsUpdate");

exports.onMessagesUpsert = async ({ socket, messages, groupCache }) => {
  // Verifica si hay mensajes
  if (!messages.length) {
    return;
  }

  // Recorre cada mensaje
  for (const webMessage of messages) {
    const timestamp = webMessage.messageTimestamp;

    // Ignora mensajes antiguos
    if (isAtLeastMinutesInPast(timestamp)) {
      continue;
    }

    // Verifica si es una acción de añadir o salir del grupo
    if (isAddOrLeave.includes(webMessage.messageStubType)) {
      let action = "";

      if (webMessage.messageStubType === GROUP_PARTICIPANT_ADD) {
        action = "add";
      } else if (webMessage.messageStubType === GROUP_PARTICIPANT_LEAVE) {
        action = "remove";
      }

      // Llama al manejador de eventos de grupo
      onGroupParticipantsUpdate({
        userJid: webMessage.messageStubParameters[0],
        remoteJid: webMessage.key.remoteJid,
        socket,
        groupCache,
        action,
      });
    } else {
      // Carga funciones comunes como comandos
      const commonFunctions = loadCommonFunctions({ socket, webMessage });

      if (!commonFunctions) {
        continue;
      }

      // Ejecuta el comando dinámico
      await dynamicCommand(commonFunctions);
    }
  }
};
